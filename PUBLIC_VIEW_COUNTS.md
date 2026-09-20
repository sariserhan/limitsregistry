# Public view counts

Limits show a page-view total beside their introductory metadata. Category totals
measure visits to the category page itself, independently of its Limits. The special
“all” directory is not treated as a category. Verified bounty cards show a shared
bounty-view total on the archive and individual Limit pages.

Each mounted Limit/category counter sends an uncached POST to `/api/views` and
shows the returned, atomically incremented total. Bounties wait until their card
intersects the viewport. A browser refresh creates a new random request receipt;
React effect replay shares its existing request. The server also deduplicates receipt
UUIDs transactionally, including concurrent retries. Navigation prefetches don't
increment counts. Each actual component mount counts; restoring an existing cached
client component without remounting does not create another view.

These are browser views starting when this feature is enabled, not unique people or
historical traffic imported from VisitorPing. JavaScript-disabled visits are not
counted; browser automation may count. The endpoint validates public target status,
rejects cross-origin browser requests, and limits submissions to 120/minute/IP.
Deliberate distributed inflation is still possible; totals are not audited ad metrics.
No visitor identity, IP address, user agent, or account ID is stored in view tables.

Page content caching is preserved. POST responses and client fetches use no-store.
A failed request shows “Views unavailable”, never a fabricated zero. Public totals
are persistent PostgreSQL bigint counters, returned as decimal strings. A tooltip
explains counting semantics and when tracking began.

Migration: `drizzle/0027_public_view_counts.sql` creates `public_view_counts` and
`public_view_receipts`. Applied and verified in the disposable local PostgreSQL DB.
**Production migration 0027 is applied and the application is deployed.** See the production verification below. The daily `/api/cron/view-receipts` job uses `CRON_SECRET` and removes
receipts older than 48 hours (normally within 72 hours of creation); totals are retained.
If the cron is disabled, receipts remain until cleanup runs. The historical record backfill is documented below.

Checks: concurrent increment and receipt idempotency, independent target totals,
private-target rejection, cleanup preserving totals, request validation, same-origin
handling, rate limits, failure responses and cron authentication. Run DB tests with
`PUBLIC_VIEWS_TEST_DATABASE_URL` pointing explicitly at a disposable migrated database.
Browser verification covers refresh increments on Limit/category pages and visible
bounty cards; offscreen bounty counters do not eagerly increment. Do not interpret
these local checks as a production rollout.


## Production migration — 2026-09-20

- Verified the Limits Registry database host and existing 0026 journal hash before
  applying 0027 in a transaction. Both view tables were absent before the migration.
- Migration SHA-256:
  `a84e9938a0f4712fc632a60502bffe97a3ce8adf8e937f8fc2d4f2f4296b0840`;
  Drizzle timestamp `1789889993489`. Earlier journal entries were preserved.
- Verified all six columns and their types/nullability, validated constraints, and
  all three indexes. Bounty counts stayed unchanged (18 total, 17 verified).
  Repeating the guarded migration returned an empty applied list.
- Temporary authenticated runner `dpl_HoW1ADBzzmsvaL2H8mU66jMGcDsA` was deleted,
  along with its local authorization files. The canonical app remains on
  `dpl_GWjTLfPPGKiZfL9ESPmJf9DsjL4F`.
- Live browser verification on `/limits/LR-003318` displayed “1 page view”, then
  “2 page views” after a refresh. The unavailable-counter error is resolved.
  Runner endpoint returns 404, and all recorded aliases still point to their
  original application deployments.

## VisitorPing historical export and record backfill

The current Pages API returns `views`, including humans, crawlers and AI agents.
The `traffic` parameter and `uniqueVisitors` are removed. Tracker history starts
2026-08-28; edge crawler history begins 2026-09-20. Earlier history is tracker-only.
The human-only exports below document the original import, now corrected by 0029. `scripts/export-visitorping-history.ts` reads
`VISITORPING_API_SECRET` from `.env.local` (or the process environment) and discovers
the matching domain and site ID through authenticated `GET /api/v1/sites`.
Optional `--site-id` or `VISITORPING_SITE_ID` must match that discovery. It follows every opaque
cursor, checks the returned site/domain and date range, preserves exact paths, and
refuses duplicate paths or malformed data. It writes a private local export only;
it does not update production counts. Existing output files are not overwritten.

Example: `npx tsx scripts/export-visitorping-history.ts`.
Use `--from 2026-09-20 --to 2026-09-20` to audit the daily rankings.
The default cutoff is 2026-09-19 inclusive, before live counting began on September
20. The Pages API has only whole-day boundaries: it cannot isolate September 20
views before our live counter began. Therefore a simple pre-cutoff backfill would
avoid double-counting but leave that partial-day gap; do not call it a complete
all-time total. Historical all-visit totals include crawlers; the ongoing browser counter only
observes clients that execute JavaScript. It does not count all edge crawler visits.

An explicit later `--to` is allowed for read-only audits; the summary flags overlap
with live counters. It is not an import command.

Authenticated verification on 2026-09-20 succeeded using the public tracker ID;
site discovery confirmed Limits Registry. The full export through September 20
matched the supplied benchmarks: 1,302 paths, 1,583 human page views, and `/` with
341 views across 19 active days. Pagination completed in two requests. There were
1,153 Limit paths and 20 category paths. `/limits/LR-003318` had 5 views over 2 days.
The separate export through September 19 contained 1,263 paths and 1,081 views;
LR-003318 had 1 view before that cutoff. Recent rollups may still change.

Private local exports: `/private/tmp/limitsregistry-visitorping-audit-sep20.json`
and `/private/tmp/limitsregistry-visitorping-cutoff-sep19.json`. These are temporary
verification artifacts, not a durable backup. Migration 0028 imports the matching published record totals as described below. Per-bounty card history cannot be derived from page totals.


### Production record backfill — 2026-09-20

Migration `0028_visitorping_record_history` adds 88 human page views through
September 19 across 52 matching published records. One nonmatching historical
path is excluded. Zero-view paths are omitted. Existing live totals are incremented
atomically, with no new UI or separate historical counter. Category and bounty
counts are unchanged. The whole-day gap noted above
still apply; this is a recorded total, not a complete unique-visitor count.

The transaction and Drizzle journal prevent a repeat migration from importing twice.
Do not run this data SQL directly outside the migration runner. Production verification
checked every count against the export and the previous value; repeating the guarded
migration returned no applied migrations and left counts unchanged. LR-003318 changed
from 2 to 3 before the browser verification visit. A rolled-back local fixture verified
existing totals, exclusion of private records, and preservation of category counts.

Migration SHA-256: `5c31f9eaf4aa4c67a064c7091fd0c6c9c518a5bfae98899e5cb55c7d49489c39`.

Live browser verification showed a single “4 page views” counter on LR-003318,
including the verification visit. Temporary migration deployment
`dpl_Aeta8EKBKzfrFfaEwdEAsyPiTWyH` and its local credentials were removed.

### Revised VisitorPing contract and correction — 2026-09-20

The export client now requires `views` and sends no `traffic` parameter. It rejects
legacy `pageviews` rows, preserves opaque pagination, and accepts an explicit
`--from` for daily audits. Six focused tests, typecheck and lint passed.

Fresh daily results for September 20 exactly matched the provider benchmarks:
`/sponsor` 342, `/sponsor/bounties` 171, `/submit` 157, `/login` 148, `/` 63.
There were 1,402 daily paths and 2,990 views. The full-range export contained 2,238
paths and 9,483 views across three requests; the old 1,302-path benchmark no longer
applies. The pre-September-20 export contained 6,493 views across 1,263 paths.

Migration `0029_visitorping_all_visit_history` adds only the difference between the
new pre-cutoff totals and migration 0028, preserving live increments. Production
received 4,086 additional views across 1,118 matching published records. Every
counter was checked against its previous value plus the correction, and rerunning
the guarded migration changed nothing. Categories and bounties were unchanged.
LR-003318 changed from 4 to 7 before the verification visit. A rolled-back local test
proved 10 live views + 1 old historical view + 3 correction = 14, with private
records excluded and category counts preserved.

The historical cutoff remains September 19. This is a one-time historical correction,
not continuous VisitorPing synchronization; live increments still require JavaScript.
The September 20 partial-day gap remains, and edge crawler history before September
20 is unavailable from VisitorPing. There is still only one visible total per record.

Migration SHA-256: `8ab12105337f26954cf695226d8c2d8484094d89a88a074ed491b2f49f99df83`.

Live browser verification displayed a single “8 page views” total on LR-003318,
including the verification visit. Temporary runner `dpl_BvpEZ2ooXdfeJw5gChfcWKukP5zk`
and its local authentication files were removed.
