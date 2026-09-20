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
**Production migration and app deployment are pending.** Deploy the migration before
the application. The daily `/api/cron/view-receipts` job uses `CRON_SECRET` and removes
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
