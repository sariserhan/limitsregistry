## Implementation amendments (2026-09-20)

The agreed first release below supersedes conflicting details in the original proposal retained after this section.

- Ordinary verified bounty listings remain free. Manually quoted fees buy a labelled, nonexclusive sponsor panel on the linked Limit for an agreed period, defaulting to 90 days. They do not buy editorial acceptance, search ranking, research outcomes, or guaranteed award payment.
- Commercial terms live in `bounty_sponsorships`, separate from `research_bounties`. No term means unsponsored. Existing rows are untouched by migration `0025_bounty_sponsorships.sql`. Renewals create new rows, preserving each invoice, fee, payment timestamp, and placement window.
- States: `REQUESTED → INVOICED → PAID → LAPSED`. Requested/invoiced/paid/lapsed terms can be cancelled; paid/lapsed/cancelled paid terms can record an externally completed full refund. Cancelled/refunded terms do not display. Cancellation does not move money. Partial refunds and automatic checkout are outside this release.
- Invoicing and payment require independent editorial verification and an active bounty linked to a published Limit. Payment never changes editorial status. A renewal starts as a fresh request; paid/lapsed periods cannot overlap for the same bounty (cancelled/refunded placement can be replaced). All financial transitions are serialized and atomically audited without private financial values in shared audit events.
- `/sponsor` accepts an anonymous, rate-limited enquiry (10/minute/IP), searches published Limits, and requires official award terms, sponsor website, contact email, and acknowledgement. It atomically creates an unverified bounty and a requested term. No email is sent automatically; administrators use the enquiry queue to contact the sponsor and invoice externally.
- `/admin/sponsorships` requires ADMIN for reads and each action. It records invoices, received payments with UTC windows, cancellation, full-refund references, and renewal requests. Existing editorial review remains in `/console/research/bounties`.
- Placement requires `PAID`, `startsAt <= now < endsAt`, VERIFIED and unexpired bounty, and a currently published Limit. The sponsor component renders per request instead of using the Limit page's one-hour cache. It selects only public placement fields. Sponsor links use `rel="sponsored noopener noreferrer"` and credential-free HTTPS URLs.
- When a paid term ends, the extra panel disappears. Ordinary attribution and the independently verified bounty archive remain; bounty expiry still controls active listings. There is no perpetual paid placement.
- Daily `/api/cron/bounty-sponsorships` at 07:00 UTC performs idempotent bookkeeping under `CRON_SECRET`. Display expiry does not depend on the cron running. No additional provider, store, or payment dependency is required.
- Verification: typecheck, lint, production build, full test suite, and focused PostgreSQL lifecycle tests passed. Browser checks covered published-Limit search, mobile enquiry submission and persistence, paid-link attributes, and expiry with the status still PAID. Anonymous admin access redirects to login; admin action authorization and UTC parsing were tested programmatically. An authenticated admin browser click-through was not performed.
- Category expansion: `/sponsor` supports one Limit or an entire category. A category request creates one category-scoped bounty and one commercial term; the award amount is a shared category pool, not an amount multiplied by the number of records. One editorial decision, invoice, payment, renewal, cancellation, and refund apply to the whole category.
- Category coverage is live: all current and newly published records in the selected category are included while the paid term is active; drafts, unrelated records, and records moved out are excluded. Paid panels appear on the category page and covered Limit pages. The public archive lists each shared category bounty once. Financial/contact fields remain private.
- Migration 0026 adds nullable category scope to research bounties, with an index and a constraint prohibiting simultaneous category and single-Limit targeting. Existing single-Limit records are unchanged.
- Migrations 0025 and 0026 are applied in production (see verification below). The sponsorship application routes still require deployment; the current canonical deployment remains unchanged.


## Production migration verification — 2026-09-20

- Confirmed the Limits Registry production database in Neon project `lucky-math-24474654`. The latest existing journal entry was 0024 with its exact committed SHA-256; both pending sponsorship schema changes were absent.
- Applied 0025 and 0026 in one transaction with their journal entries. Preserved the older sparse migration history instead of replaying already-existing schema changes.
- `0025_bounty_sponsorships`: SHA-256 `5e109a531c18e20c248190fe4560cac26666886d5a9cbc45e037e5c3b2812966`.
- `0026_category_sponsorships`: SHA-256 `e4dab682154b599fdb433b5590655bc80bb8489b6c5f86c2f4a90984edc41e11`.
- Verified every column, check constraint, foreign key, and index on the two affected tables against the committed 0026 snapshot. Existing bounty counts remain 18 total and 17 verified. A repeated guarded migration returned no pending changes.
- The temporary authenticated migration deployment was deleted; its endpoint returns 404. The default Vercel alias was restored after the CLI assigned it to the runner despite `--skip-domain`. The canonical domain stayed on `dpl_BoucaDpw7EvtudbXMFCA6nkqM1zv`; live homepage and public API checks returned 200.
- Database migrations are complete. Deployment of the sponsorship UI, server actions, and daily expiry cron remains a separate pending release step.

---

# Sponsored Bounties — Implementation Spec

> **For the implementing agent.** Read this and the `researchBounties` table in
> `src/db/schema.ts` before writing anything. Roughly half of this already
> exists; the job is mostly to make it earn money without making us a payments
> company.

**Goal:** organisations pay to sponsor a research bounty against a specific
limit, and get durable attribution on that limit's page.

**Why this rather than ads:** the registry reads as a reference work. Display
ads next to "the verified boundaries of what is possible" make it look like a
content farm and undercut the dataset's licensing value. A sponsor funding
research *on a specific limit* attaches money to the thing that makes the site
credible instead of sitting beside it, and has no traffic floor — one sponsor
can be worth a year of impressions.

---

## The one decision that shapes everything

**We do not hold or disburse bounty money.**

Taking a sponsor's $5,000, holding it until someone proves a limit, then paying
that person is money transmission. In most jurisdictions that needs licensing,
KYC, and an escrow arrangement, and getting it wrong is a legal problem rather
than a bug. A registry with a handful of sponsors cannot carry that.

So:

- The **bounty award** is settled directly between sponsor and claimant, off
  platform. We record its existence, terms and source URL — which is what the
  existing `sourceUrl` column is already for.
- We charge a **listing fee** for verification and placement. That is a service
  we perform, invoiced normally, and it is not escrow.

Everything below follows from that. If the owner later wants true escrow, it is
a separate project with legal input, not an extension of this one.

---

## Global constraints

- Drizzle + Postgres, `src/db/schema.ts`. Match the file's style: `...audit`,
  `index()`, and a `check()` for every invariant expressible in SQL.
- No payment dependency. `package.json` has no Stripe/Paddle/Polar and this
  spec does not add one. Invoice by hand in phase 1.
- Public-facing bounty rules already exist in `isPublicBounty()` — reuse it,
  do not reimplement the status/expiry logic.
- Admin actions gate on `requireRole()` from `src/auth/session.ts`.

---

## What already exists

`researchBounties` in `src/db/schema.ts` has: `limitId`, `title`, `sponsor`,
`description`, `sourceUrl`, `status`, `amount`, `currency`, `expiresAt`,
`submittedByUserId`, `verifiedByUserId`, `moderationNote`, `verifiedAt`, audit.

With check constraints already enforcing: status in
`UNVERIFIED/VERIFIED/REJECTED/WITHDRAWN`, ISO-4217 currency shape, positive
two-decimal amount, amount and currency both-or-neither, and `https://` source
URLs. Indexes on `limitId`, `status`, and `(status, expiresAt)`.

A public query filters to `VERIFIED` and unexpired, joined to published limits.

**This is a good table.** The moderation workflow is done. What is missing is
everything about the sponsor paying us.

---

## Task 1 — Sponsorship columns

**File:** `src/db/schema.ts` (modify `researchBounties`)

```ts
  // NEW columns on researchBounties.
  //
  // A sponsored bounty is one where the sponsor paid us a listing fee. An
  // unsponsored one is a bounty someone told us about -- an existing prize, a
  // grant -- which we list because it is useful. Both are real; only one is
  // revenue, and conflating them would misstate both the money and the
  // editorial position.
  sponsorshipStatus: text("sponsorship_status").default("NONE").notNull(),
  listingFeeAmount: text("listing_fee_amount"),
  listingFeeCurrency: text("listing_fee_currency"),
  sponsorUrl: text("sponsor_url"),
  sponsorContactEmail: text("sponsor_contact_email"),
  sponsorshipStartsAt: timestamp("sponsorship_starts_at", { withTimezone: true }),
  sponsorshipEndsAt: timestamp("sponsorship_ends_at", { withTimezone: true }),
  invoiceReference: text("invoice_reference"),
```

Add to the table's constraint array:

```ts
  index("bounties_sponsorship_idx").on(t.sponsorshipStatus, t.sponsorshipEndsAt),
  check("bounties_sponsorship_status_valid",
    sql`${t.sponsorshipStatus} in ('NONE', 'REQUESTED', 'INVOICED', 'PAID', 'LAPSED')`),
  // Placement is only ever granted by payment landing. A row cannot claim a
  // paid window without saying when it runs.
  check("bounties_sponsorship_window_paired",
    sql`(${t.sponsorshipStatus} in ('PAID', 'LAPSED')) = (${t.sponsorshipStartsAt} is not null and ${t.sponsorshipEndsAt} is not null)`),
  check("bounties_sponsorship_window_ordered",
    sql`${t.sponsorshipEndsAt} is null or ${t.sponsorshipStartsAt} is null or ${t.sponsorshipEndsAt} > ${t.sponsorshipStartsAt}`),
  check("bounties_listing_fee_valid",
    sql`${t.listingFeeAmount} is null or (${t.listingFeeAmount} ~ '^[0-9]+(\\.[0-9]{1,2})?$' and ${t.listingFeeAmount}::numeric > 0)`),
  check("bounties_listing_fee_paired",
    sql`(${t.listingFeeAmount} is null) = (${t.listingFeeCurrency} is null)`),
  check("bounties_listing_fee_currency_valid",
    sql`${t.listingFeeCurrency} is null or ${t.listingFeeCurrency} ~ '^[A-Z]{3}$'`),
  check("bounties_sponsor_url_https_valid",
    sql`${t.sponsorUrl} is null or ${t.sponsorUrl} ~ '^https://[^[:space:]]+$'`),
```

**Acceptance:** existing rows migrate to `sponsorshipStatus='NONE'` untouched; a
row cannot be `PAID` without a window; a fee amount without a currency is
rejected by the database, not by TypeScript.

---

## Task 2 — Sponsorship state, separate from moderation

**File:** `src/domain/bounty-sponsorship.ts` (NEW)

Two independent axes, and keeping them independent is the point:

- **Moderation** (`status`): is this bounty real and worth listing? Unchanged.
- **Sponsorship** (`sponsorshipStatus`): has the sponsor paid us?

```
NONE ──request──> REQUESTED ──invoice──> INVOICED ──payment──> PAID ──expiry──> LAPSED
                      │                      │
                      └──── withdrawn ───────┴──> NONE
```

```ts
/**
 * Whether a bounty gets sponsor placement right now.
 *
 * Deliberately requires BOTH: editorially verified and currently paid. A paid
 * bounty we have not verified must never appear, or the fee has bought
 * editorial placement, which is the thing that would make this indistinguishable
 * from an ad.
 */
export function hasActiveSponsorship(bounty: {
  status: string;
  sponsorshipStatus: string;
  sponsorshipEndsAt: Date | null;
}, now: Date): boolean;

/** Rows whose paid window has closed, for the expiry job. */
export function isSponsorshipLapsed(bounty: { sponsorshipStatus: string; sponsorshipEndsAt: Date | null }, now: Date): boolean;
```

**Acceptance (write these tests first, they are the rules that matter):**

- `PAID` + `UNVERIFIED` → no placement.
- `PAID` + `VERIFIED` + window open → placement.
- `PAID` + `VERIFIED` + `sponsorshipEndsAt` in the past → no placement.
- `NONE` + `VERIFIED` → listed as a bounty, no sponsor attribution.

---

## Task 3 — Sponsor enquiry form

**Files:** `app/sponsor/page.tsx` (NEW), server action alongside it

Public page. Collects: which limit (search by registry number or title),
bounty title, description, award amount and currency, expiry, sponsor name,
sponsor URL, contact email.

Writes a row with `status='UNVERIFIED'`, `sponsorshipStatus='REQUESTED'`.

- Rate limit with `allowRequest()` keyed on `clientIp()` — reuse the helper in
  `app/api/export/route.ts`, do not write a second IP parser. This form is a
  spam target.
- Validate `sourceUrl` and `sponsorUrl` are `https://` in the action as well as
  the database, so the user gets a message instead of a constraint error.
- Do not accept payment details here. The page says an invoice follows
  verification.

**Acceptance:** a submission appears in admin as `UNVERIFIED` / `REQUESTED` and
nowhere public; eleven submissions in a minute from one IP are refused.

---

## Task 4 — Admin sponsorship workflow

**File:** `app/admin/bounties/page.tsx` (NEW or extend existing bounty admin)

Admin-only via `requireRole()`. Actions:

- **Verify / reject** — existing moderation, unchanged.
- **Record invoice** — set fee amount, currency, `invoiceReference`,
  `sponsorshipStatus='INVOICED'`.
- **Mark paid** — set the window (`startsAt`, `endsAt`), `sponsorshipStatus='PAID'`.
- **Lapse** — manual override.

Every transition writes to `auditLogs`. A record of who granted paid placement,
and when, is the thing that answers the "is this site for sale" question later.

**Acceptance:** marking paid without a window is impossible in the UI and
rejected by the database if attempted directly.

---

## Task 5 — Placement on the limit page

**File:** the limit detail page under `app/limits/[registryNumber]/`

Where a bounty is shown for that limit, and `hasActiveSponsorship()` is true:

- Sponsor name, linked to `sponsorUrl` with `rel="sponsored noopener"`.
  **`rel="sponsored"` is not optional** — it is Google's required disclosure for
  paid links, and omitting it risks a manual action against the whole site.
- A visible label: **"Sponsored bounty"**. Not a subtle tint. A reference work
  that hides which placements were paid for has stopped being a reference work.
- Unsponsored bounties render exactly as today, with no sponsor block.

**Acceptance:** rendered HTML contains `rel="sponsored` and the words
"Sponsored bounty" for a paid bounty, and neither for an unpaid one.

---

## Task 6 — Expiry job

**File:** `app/api/cron/bounty-sponsorship/route.ts` (NEW)

Follow the existing cron routes in `app/api/cron/` — same auth guard and shape
as `arxiv-radar` and `weekly-digest`.

Daily: set `sponsorshipStatus='LAPSED'` where `PAID` and `sponsorshipEndsAt` has
passed. Placement must stop on its own. If it needs a human to remember, a
sponsor eventually gets months of free placement and nobody notices.

**Acceptance:** a row one second past its window is lapsed by the next run and
loses placement.

---

## Out of scope

- Holding, escrowing or disbursing bounty award money. See the decision above;
  this is a legal question, not an engineering one.
- Self-serve card payment for the listing fee. Invoice by hand.
- Sponsor dashboards, impression counts, click tracking.
- Sponsored placement anywhere except the limit page a bounty belongs to. No
  homepage slots, no search results. Sponsorship attaches to research on a
  specific limit; the moment it buys general visibility it is an ad.

## Open questions for the owner

1. Listing fee — flat, or scaled to the bounty amount?
2. Default sponsorship window. 90 days is the assumption here.
3. Does an unsponsored bounty someone reports get listed at all, or is listing
   itself the paid product? This spec assumes both are listed and only
   attribution differs, which keeps the registry useful and the fee honest.
4. Is one sponsor per limit exclusive, or can several appear?
