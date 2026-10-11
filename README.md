# Limits Registry

Limits Registry is a curated public record of mathematical and theoretical-computer-science limits.

## Local development

Requirements: Node.js 20+, npm, and Docker.

```bash
npm install
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run dev
```

The local database is PostgreSQL 16 in Docker. Production uses Neon PostgreSQL through the same `DATABASE_URL` and Drizzle schema.
The database health check is available at `/api/health/db`. Production records should only be inserted after evidence and editorial review; the current UI fixtures remain intentionally separate from the empty production schema.

## Database workflow

```bash
npm run db:generate  # create a reviewed migration
npm run db:migrate   # apply migrations
npm run db:studio    # inspect locally
```

Never commit `.env.local` or production credentials. In Vercel, configure a Neon pooled connection string as `DATABASE_URL` separately for Preview and Production.

## Verification

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

### VisitorPing origin resource samples

Production-only reporting uses `VISITORPING_RESOURCE_REPORTING_ENABLED=true` and
`VISITORPING_RESOURCE_MERCHANT_TOKEN` (server secret; never NEXT_PUBLIC). The scoped
credential expires after 90 days. Renew deliberately through the VisitorPing owner
account before expiry; revoke it there to stop ingestion. The connection utility
lives in VisitorPing as `scripts/connect-limitsregistry-resources.mjs` (dry run by
default). This uses the existing Upstash quota service, not a new subscription.

Public v1 API handlers and `/api/search` emit at most one sample per warm process
per minute, subject to a shared 900-attempt rolling-day budget. Only successful
origin responses are included. CDN cache hits, skipped requests, HTML rendering,
MCP streams and failed delivery are not covered. No extrapolation or AI attribution
is performed. These are partial origin measurements, not the provider invoice.

`apiCalls` counts sampled API invocations. `databaseReads`/`databaseWrites` count
attempted SELECT/INSERT/UPDATE/DELETE statements via an isolated async request
context, not rows or CU-hours. Ambiguous SQL causes the DB counters to be omitted.
`bandwidthBytes` measures generated uncompressed JSON body bytes, capped at 256 KiB
and one second; larger/streaming bodies remain unknown. CPU and other unmeasured
resources remain absent. SQL text, parameters, response contents, URLs, request
headers, and user identifiers are never transmitted in resource reports.

Reporting runs after delivery, times out after five seconds, rejects redirects,
and fails without changing API responses. Failed requests are not retried or replayed
as new measurements. Coverage may be incomplete on reporting failures; the receiving
service also enforces its existing 1,000-attempt daily site quota. Resource sampling
must not be used as a count of users, customers, or total traffic.
