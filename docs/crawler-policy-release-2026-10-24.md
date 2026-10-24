# Public crawler access notice

The policy version `limitsregistry-crawl-2026-10-24-v1` describes automated page
access after publication: explicit enrollment and authorization, USD $0.01 per
successful HTML GET for the monthly option, monthly or $100 collection, excluded
requests, and no retroactive billing. The terms page links it. Human browsing,
linking and citation remain free.

`/license.xml`, `/robots.txt`, and `/crawl-policy` are static route handlers.
Their proxy bypass prevents VisitorPing's optional database-backed adapter from
overriding the release-controlled policy. Route handlers do not render the
database-backed root layout. They work when VisitorPing or the origin database
is unavailable. Existing robots private-path exclusions and sitemap remain.

`src/ops/crawl-policy.ts` is the exact standalone copy of VisitorPing's
`apps/crawler-edge/src/limitsregistry-policy.ts`. Keep the two files
byte-identical and deploy both repositories/edge when changing this policy.
The owner-operated Cloudflare Worker serves the same documents without upstream
requests and excludes `/terms` and `/crawl-policy` from page billing. The
historical database policy row and previous evidence are not rewritten.

Validation: seven focused static-document/canonical-host tests, TypeScript,
targeted ESLint and the production build passed. Playwright Chromium at
1440×1000, 390×844 and with JavaScript disabled verified heading/title, no blank
page or framework overlay, no console errors, no horizontal overflow, zero API
requests and the license-download interaction. The local production server used
an unreachable database URL. Browser plugin unavailable; existing Playwright
used. Screenshots and QA scripts are outside the repository in `/tmp`.

This changes public notices and access discovery only. It creates no payment,
invoice, customer, migration or historical debt. Billing/enrollment depends on
VisitorPing's database recovery; a caller must pause if those services are
unavailable. User-agent enforcement remains cooperative and cannot identify all
automation or prove a company's training use.
