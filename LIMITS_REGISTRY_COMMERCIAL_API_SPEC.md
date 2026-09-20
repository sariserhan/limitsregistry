# Commercial API Tier — Implementation Spec

> **For the implementing agent.** Read this and `src/db/schema.ts` before writing
> anything. Every path, table and helper named here exists unless marked NEW.

**Goal:** high-volume commercial consumers pay for bulk and fresh access to the
registry, while the registry itself stays free and open.

**Model:** Wikimedia Enterprise. The Foundation does not license Wikipedia's
content — it sells *access*: snapshots, freshness, reliability, support. Content
stays free forever. We copy that exactly, because this site is a public registry
and a paywall would destroy what makes it worth paying for.

**Why now:** AI crawlers consume the whole registry for free and we pay the
hosting. In September 2026 crawler load contributed to exhausting the database
quota and taking production down. Blocking training crawlers (done separately in
VisitorPing AI Traffic) removes the free bulk path; this spec is the paid one
that replaces it. **Neither works without the other** — blocking without a paid
route just loses us the data's reach, and a paid route without blocking sells
something anyone can still take for free.

---

## Global constraints

- **The free tier must not regress.** `/api/v1/*` is public and unauthenticated
  today and stays that way. Keys unlock *more*, never restore what was removed.
- **No new payment dependency in phase 1.** There is no Stripe/Paddle/Polar in
  `package.json` and this spec does not add one. Phase 1 invoices manually;
  automated billing is phase 2 and out of scope here.
- Drizzle + Postgres, schema in `src/db/schema.ts`. Follow the file's existing
  style: `pgTable`, `...audit`, `index()`, and `check()` constraints for every
  invariant expressible in SQL. That codebase validates in the database, not
  only in TypeScript.
- `runtime = "nodejs"` on all routes, matching `app/api/v1/limits/route.ts`.
- Rate limiting goes through `allowRequest()` in `src/ops/rate-limit.ts`. It
  falls back to an in-process window when Upstash is unconfigured — do not
  assume Redis exists.
- Never log or return a full API key after creation.

---

## What already exists

| Thing | Where | Note |
|---|---|---|
| Public JSON API | `app/api/v1/limits/`, `v1/limits/[registryNumber]/`, `v1/categories/` | Unauthenticated, paginated, `pageSize` capped at 100 |
| Kill switch | `src/api/v1-paused.ts` (`API_V1_PAUSED`, `pausedApiResponse`) | Respect it in every new route |
| CSV export | `app/api/export/route.ts` | IP rate limited, CSV formula-injection guarded |
| MCP endpoint | `app/api/mcp/route.ts` | |
| Rate limiting | `src/ops/rate-limit.ts` | `allowRequest(key, limit, windowMs)` |
| Client IP | `app/api/export/route.ts` → `clientIp()` | Uses the **last** `x-forwarded-for` hop; the client controls the rest. Reuse this, do not rewrite it |
| Developer docs page | `app/developers/page.tsx` | Where the tiers get documented |
| Auth + roles | `src/auth/` (`auth.ts`, `session.ts`, `permissions.ts`) | better-auth; `requireRole()` for the console |

**Not present, all NEW:** API keys, tiers, usage accounting, bulk snapshots,
billing.

---

## Task 1 — API key schema

**Files:** `src/db/schema.ts` (modify), new migration via the project's normal
drizzle flow.

Two tables.

```ts
// NEW. A key is only ever stored hashed; the plaintext is shown once at
// creation and never again, like every other credential in this codebase.
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  // sha256 of the full key, hex. Lookup is by this, so it is unique.
  keyHash: text("key_hash").notNull(),
  // First 12 chars ("lr_live_ab12"), shown in the UI so a holder can identify
  // which key is which without us storing the secret.
  keyPrefix: text("key_prefix").notNull(),
  organizationName: text("organization_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  tier: text("tier").default("FREE").notNull(),
  status: text("status").default("ACTIVE").notNull(),
  // Free-text note from whoever issued it: which deal, which contact.
  note: text("note"),
  issuedByUserId: text("issued_by_user_id"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...audit,
}, (t) => [
  uniqueIndex("api_keys_hash_uidx").on(t.keyHash),
  index("api_keys_status_idx").on(t.status),
  check("api_keys_tier_valid", sql`${t.tier} in ('FREE', 'STARTER', 'PRO')`),
  check("api_keys_status_valid", sql`${t.status} in ('ACTIVE', 'REVOKED')`),
  check("api_keys_email_valid", sql`${t.contactEmail} ~ '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'`),
  // A revoked key must carry the time it was revoked, and vice versa.
  check("api_keys_revoked_paired", sql`(${t.status} = 'REVOKED') = (${t.revokedAt} is not null)`),
]);

// NEW. One row per key per UTC day. Quotas are monthly, but daily rows make
// "when did they burn it" answerable and keep each upsert tiny.
export const apiUsageDaily = pgTable("api_usage_daily", {
  keyId: uuid("key_id").references(() => apiKeys.id, { onDelete: "cascade" }).notNull(),
  day: date("day").notNull(),
  requests: integer("requests").default(0).notNull(),
  snapshotRequests: integer("snapshot_requests").default(0).notNull(),
}, (t) => [
  primaryKey({ columns: [t.keyId, t.day] }),
  index("api_usage_day_idx").on(t.day),
  check("api_usage_counts_valid", sql`${t.requests} >= 0 and ${t.snapshotRequests} >= 0`),
]);
```

**Acceptance:** migration applies; a key row cannot exist with `status='REVOKED'`
and a null `revokedAt`; inserting tier `'ENTERPRISE'` is rejected by the check.

---

## Task 2 — Tier definitions

**File:** `src/api/tiers.ts` (NEW)

```ts
export type ApiTier = "FREE" | "STARTER" | "PRO";

export interface TierLimits {
  /** Requests per calendar month. */
  monthlyRequests: number;
  /** Requests per minute, enforced through allowRequest(). */
  perMinute: number;
  /** Whether /api/v1/snapshot is available at all. */
  snapshots: boolean;
  /** Snapshot downloads per month. Zero when snapshots is false. */
  monthlySnapshots: number;
}

export const TIERS: Record<ApiTier, TierLimits> = {
  FREE:    { monthlyRequests: 5_000,   perMinute: 30,  snapshots: false, monthlySnapshots: 0 },
  STARTER: { monthlyRequests: 100_000, perMinute: 120, snapshots: true,  monthlySnapshots: 30 },
  PRO:     { monthlyRequests: 1_000_000, perMinute: 600, snapshots: true, monthlySnapshots: 300 },
};

/**
 * Anonymous callers keep exactly what they have today. This is the line that
 * makes the whole design honest: the registry stays free and open, and a key
 * buys volume and freshness rather than access.
 */
export const ANONYMOUS_PER_MINUTE = 60;
```

Prices are **not** in code — they belong on `/developers` and in an invoice, and
hard-coding them means a price change is a deploy. Suggested opening prices:
Starter $99/mo, Pro $399/mo. Confirm with the owner before publishing.

---

## Task 3 — Key verification middleware

**File:** `src/api/api-key.ts` (NEW)

```ts
export interface ResolvedKey {
  id: string;
  tier: ApiTier;
  limits: TierLimits;
  organizationName: string;
}

/**
 * Resolves `Authorization: Bearer lr_live_...` to a key, or null when the
 * request is anonymous.
 *
 * Throws nothing: a malformed or unknown key is treated as anonymous rather
 * than rejected, so a customer whose key was revoked degrades to the free tier
 * instead of having their integration fall over. Revocation is a downgrade, not
 * an outage.
 */
export async function resolveApiKey(request: Request): Promise<ResolvedKey | null>;

/**
 * Records one request against the key's day row and returns whether the caller
 * is still inside their monthly quota.
 *
 * Counts first, then decides. A request that exceeds quota is still counted,
 * because "how far over did they go" is the number that starts the upsell
 * conversation.
 */
export async function chargeRequest(key: ResolvedKey, kind: "request" | "snapshot"): Promise<{ allowed: boolean; used: number }>;
```

Implementation notes:

- Key format `lr_live_` + 32 bytes base64url from `crypto.randomBytes`. Hash with
  `crypto.createHash("sha256")`, hex.
- Look up by hash, single indexed query. Reject `status !== 'ACTIVE'` as anonymous.
- Update `lastUsedAt` at most once an hour per key — a write on every request
  turns a read API into a write-heavy one, and this database has already hit a
  quota once.
- Monthly usage = `sum(requests)` over `day >= date_trunc('month', now())`.
- Upsert the day row with `onConflictDoUpdate` and `sql\`requests + 1\``, never
  read-then-write. Concurrent requests must not lose counts.

**Acceptance:** an unknown key behaves exactly like no key; a revoked key
behaves exactly like no key; two concurrent requests increment by two.

---

## Task 4 — Apply to the v1 routes

**Files:** `app/api/v1/limits/route.ts`, `app/api/v1/limits/[registryNumber]/route.ts`,
`app/api/v1/categories/route.ts` (all modify)

Insert after the `API_V1_PAUSED` check and before any database work:

1. `resolveApiKey(request)`
2. Rate limit key: `key ? \`api:${key.id}\` : \`ip:${clientIp(request)}\``,
   limit `key?.limits.perMinute ?? ANONYMOUS_PER_MINUTE`
3. On failure return **429** with `Retry-After: 60`
4. If keyed: `chargeRequest(key, "request")`; when `!allowed` return **402
   Payment Required** with a body naming the tier, the quota and where to
   upgrade. 402 rather than 429: they are not going too fast, they have used
   what they bought.
5. Set response headers on every keyed response:
   `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-Quota-Limit`, `X-Quota-Used`

**`pageSize` cap stays 100 for anonymous. Keyed callers may request up to 1000.**
That is the cheapest possible taste of what a key buys.

**Acceptance:** anonymous behaviour byte-identical to today except the new
headers are absent; a FREE key over 5,000 monthly requests gets 402, not 429.

---

## Task 5 — Bulk snapshot endpoint

**File:** `app/api/v1/snapshot/route.ts` (NEW)

The actual product. One request returns the whole published registry.

- **Keyed and `limits.snapshots` only.** Anonymous and FREE get **402** with a
  message pointing at `/developers`.
- `GET /api/v1/snapshot?format=json|ndjson` — default `ndjson`, because a
  consumer streaming a large registry should not have to hold it in memory.
- Contents per row: everything `/api/v1/limits` returns, plus the current
  specification version, accepted claims, and evidence URLs. This is the
  difference between the free API and the paid one — the free API describes a
  limit, the snapshot gives you the substantiation.
- Only published statuses: `OPEN`, `PROVEN`, `DISPUTED`, `RETIRED`. Reuse the
  existing repository helpers rather than writing new queries; they already
  encode that rule.
- `ETag` from the max `updated_at` across included tables. Return **304** when
  `If-None-Match` matches — a daily poller should not re-download an unchanged
  registry, and it keeps their quota and our bill down.
- Stream with a `ReadableStream`; never build the whole body in memory.
- `chargeRequest(key, "snapshot")` and enforce `monthlySnapshots`.

**Acceptance:** a PRO key gets NDJSON with one JSON object per line; the same
request with `If-None-Match` returns 304 and does **not** consume a snapshot;
a FREE key gets 402.

---

## Task 6 — Admin key management

**Files:** `app/admin/api-keys/page.tsx` (NEW), server actions alongside it

Admin-only, gated with the existing `requireRole()` from `src/auth/session.ts`.

- List keys: prefix, organisation, tier, status, month-to-date usage, last used.
- Issue a key: organisation, contact email, tier, note. **Show the plaintext
  once**, with the same warning language the codebase already uses for
  credentials, and never again.
- Revoke: sets `status='REVOKED'` and `revokedAt`, both or neither.
- Change tier without reissuing, so an upgrade is not an integration change.

**Acceptance:** a non-admin session gets the same rejection as any other admin
route; the plaintext key appears in exactly one response and is not in the
database.

---

## Task 7 — Publish the tiers

**File:** `app/developers/page.tsx` (modify)

Document: the free tier and its limits, what a key adds, the snapshot format,
the 402-vs-429 distinction, and how to request a key (a mailto or a form — not
self-serve checkout in phase 1).

Say plainly that the registry's content is free and open and that paid tiers buy
access characteristics, not rights. That sentence is the product.

---

## Out of scope

- Automated billing, checkout, card handling. Phase 1 invoices by hand; ten
  customers do not justify a payment integration, and building one before the
  first sale is how this stalls.
- Self-serve key signup. Issue by hand; every early key should come with a
  conversation.
- Per-key custom pricing or contracts.
- Changing what the website shows to humans. Nothing here touches page rendering.

## Open questions for the owner

1. Opening prices for Starter and Pro.
2. Does the free tier require a key at all above some volume, or stay fully
   anonymous forever? This spec assumes fully anonymous.
3. Should the snapshot include `evidence.url` values, given some point at
   paywalled sources?
