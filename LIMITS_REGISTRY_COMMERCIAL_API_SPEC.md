# Commercial API pilot — implementation and operating guide

This replaces the original FREE / STARTER / PRO proposal following product review.

## Product

The public registry and its existing v1 record endpoints remain free and anonymous.
The paid pilot sells a convenient, consistent bulk delivery of the same published
information. Claims and evidence are already available through the public detail
endpoint; they are not exclusive paid content.

There is one **PILOT** tier, manually invoiced with keys issued by an administrator.
Price, intended use and freshness needs are agreed directly before issuing a key.
There is no checkout, automatic billing, monthly quota, paid page-size uplift, or
free-key requirement. When the pilot ends, an administrator revokes the key.

Snapshots are **manually published after editorial releases**. They remain unchanged
until an administrator publishes another. There is no guaranteed update cadence or
uptime SLA during the pilot. Blocking crawlers is not a prerequisite for this product
and is outside this change.

## Public access and pause behavior

- `/api/v1/limits`, `/api/v1/limits/[registryNumber]`, and `/api/v1/categories`
  retain their existing response shapes, caching and page limits (maximum 100).
- These endpoints ignore API keys: no key lookups, usage writes or monthly caps.
- `API_V1_PAUSED=true` pauses all v1 endpoints with a non-cacheable 404. Defaults
  to false; changing the environment requires restarting/redeploying the app.
- `/developers` remains visible during a pause and shows a pause notice.
- CSV, MCP and public page rendering are not monetized by this implementation.

## Credential and usage model

`api_keys` stores the SHA-256 hash of `lr_live_` plus 32 random base64url bytes.
The first 16 characters identify a key; the full token is returned only when issued.
Admin listing and audit events never contain the token or hash.

Keys have organisation, contact email, optional deal note, issuer, PILOT tier,
ACTIVE/REVOKED status and paired revocation time. SQL constraints enforce these
invariants. Admin actions independently require ADMIN, including direct calls.
Rotation means issue a replacement, update the integration, then revoke the old key.

`api_usage_daily` counts **download starts per key per UTC day** with an atomic
upsert. It also stores the last download time; there is no separate per-request
key update or monthly quota query. A 304, rejected request or failure to open
storage is not counted. A transfer that fails after streaming starts can count.
The admin console shows month-to-date downloads and the last download time.
Usage is operational reporting, not automatic metered billing.

## Snapshots

Admin publication at `/admin/api-keys`:

1. Read published records in batches of 100 under one repeatable-read transaction.
2. Select each record's latest specification, unique ACCEPTED claims for that
   specification, direct evidence and evidence linked to those accepted claims.
   DRAFT records and draft-only claim evidence are excluded.
3. Write JSON and NDJSON to temporary files, hashing their actual bytes. Do not
   collect the full registry in application memory.
4. Upload both immutable files to a **private Vercel Blob store**.
5. Under a database advisory transaction lock, switch the current snapshot pointer
   and write an audit event. Only one snapshot can be current. A slow older build
   cannot replace a newer publication. A failed upload leaves the previous version
   current. Clean up temporary files and attempt cleanup of failed uploads.

`api_snapshots` stores metadata, paths and hashes; no bulk bytes are stored in
Postgres. Downloads authenticate and read the manifest, then stream the existing
private file. They never query registry records or build an export.

Schema version 1 is one object per record with:

- `schemaVersion: 1` and the existing list endpoint fields;
- `specification` (current public specification shape, or null);
- `claims` (accepted public claim shape, with arbitrary-precision integers and
  rational components encoded as decimal strings);
- `evidence` (public evidence shape, with links in `sourceUrl`).

JSON is an array; NDJSON is one object per line. Records are ordered by registry
number. Both formats contain the same records. The format-specific SHA-256 is its
strong ETag. The NDJSON hash is the common dataset revision. Relationship removals
change the content hash even when parent timestamps do not change. Rebuilding
unchanged content retains its ETag.

Evidence URLs are citations, including links to subscription sources. This does
not grant access or reproduction rights to third-party source content.

## Download contract

`GET /api/v1/snapshot?format=json|ndjson` (default NDJSON), with
`Authorization: Bearer lr_live_...`.

- 400: unsupported format.
- 401: malformed, unknown or revoked supplied credential. No silent fallback on
  this paid-only endpoint; the public endpoints remain available.
- 402: no credential; request a pilot key through `/contact`.
- 429: rate limited; honor `Retry-After`.
- 503: service/storage unavailable or no published snapshot.
- HEAD: 405, to avoid implicitly starting/counting a GET download.

Pilot requests: 30/minute/key, plus a 120/minute/IP pre-auth protection limit.
Conditional requests count toward rate limits. Production snapshot downloads
require Upstash; without it they fail closed with 503. Other existing callers keep
the process-local fallback. The limiter caches independent policies by limit and
window, not a single first-caller policy.

All snapshot responses are `Cache-Control: private, no-store` and vary by
Authorization. Successful/conditional responses include:

- `ETag` (format-specific; send back as `If-None-Match`)
- `X-Snapshot-Revision` (NDJSON SHA-256)
- `X-Snapshot-Schema-Version`
- `X-Snapshot-Generated-At` (UTC data-generation time)
- `X-Snapshot-Record-Count`
- `X-RateLimit-Limit` and `X-RateLimit-Remaining` after key resolution

Matching conditional requests return 304 before opening storage or writing usage.
Authentication and rate limiting still happen first. Save the version headers
alongside each downloaded file for reproducibility.

## Release checklist

1. Apply `drizzle/0024_bright_magma.sql` using the normal migration flow to the
   **explicitly selected** target database. Migration 0023 already created
   `acquisition_events`; 0024 deliberately does not recreate it. Its generated
   schema snapshot incorporates that previous migration's missing snapshot state.
2. Connect a **private** Blob store. Set `BLOB_READ_WRITE_TOKEN`, or use a connected
   store with `BLOB_STORE_ID` and Vercel-managed OIDC. Never use a public store.
   Official setup: https://vercel.com/docs/vercel-blob/private-storage
3. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production
   snapshot limiting. Do not point preview/test deployments at production storage
   or databases.
4. Deploy. Confirm the intended `API_V1_PAUSED` value. Developer docs remain visible.
5. As ADMIN, publish a snapshot, inspect its record count and generation time,
   and issue a pilot key after agreeing the invoice and customer expectations.
6. Smoke-test NDJSON and JSON, conditional 304 without usage increase, invalid
   key 401, anonymous 402, revocation, and unchanged anonymous record access.

Publishing is bounded by the admin route's 300-second execution budget. If the
registry grows beyond that, move the same builder to a background job before
promising a freshness cadence. The initial pilot intentionally has no scheduler.

Old private files and manifests are retained for operational recovery; customers
can download only the current version through this API. Review storage retention
as part of pilot operations. Remove superseded private files when no longer needed;
never delete the current version. A force-terminated upload may leave an orphan
under `registry-snapshots/`; compare object paths to manifests before cleanup.
For an urgent data withdrawal, pause v1 access, publish a corrected snapshot, and
remove superseded objects as needed before unpausing. Already downloaded customer
copies cannot be withdrawn by this service.

## Verification

- `npm run typecheck`, `npm run lint`, `npm test`.
- Explicit disposable database integration:
  `PILOT_TEST_DATABASE_URL=<migrated test DB> npx vitest run src/api/pilot.integration.test.ts`.
- Tests cover credential constraints, concurrent usage upserts, immediate revocation,
  batch completeness, current-spec filtering, draft exclusion, BigInt precision,
  deterministic hashes and relationship-removal invalidation, conditional requests,
  cache isolation, accounting failures and independent rate-limit policies.
- Live provider delivery and production migration/deployment must be verified
  separately; mocks and local database checks do not establish either.

## Production rollout — 2026-09-20

- Applied migration `0024_bright_magma` to the verified Limits Registry production
  database (Neon project `lucky-math-24474654`) in one transaction, including its
  Drizzle journal entry. SHA-256:
  `e6db162e4c4c4df3b5d2ff76923aa1371bdfbfe3a5f9e51e38172618273ede78`.
  The previous latest journal entry matched 0023; older history was preserved.
- Production Upstash returned PONG. Private Blob storage is connected and serving
  the generated files. No replacement Redis database was needed.
- Published 1,189 records; NDJSON size 2,536,648 bytes. Dataset revision:
  `fd0409260d85700c3c7034a6b9f874d59e4681372ad90c97c9f2db7034629d32`.
- Final production deployment: `dpl_BoucaDpw7EvtudbXMFCA6nkqM1zv`, aliased to
  `https://www.limitsregistry.com`.
- Live verification passed for JSON/NDJSON equivalence, SHA-256, private response
  headers, anonymous 402, invalid/revoked key 401, conditional 304, rate-limit 429
  with Retry-After, public list/detail 200, and unauthenticated admin login redirect.
  Download usage remained at four after conditional/rate-limited requests. The
  temporary verification key was revoked.
- Vercel weakens ETags when applying transport compression (`W/"hash"`). Clients
  should return the ETag verbatim; the endpoint accepts weak conditional validators.
- The temporary authenticated release endpoint was removed from the final source
  and returns 404 on the public site. Local environment files are now explicitly
  excluded from deployment uploads with `.vercelignore`.
