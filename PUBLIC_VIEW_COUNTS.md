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
If the cron is disabled, receipts remain until cleanup runs. No preexisting history
is backfilled.

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
