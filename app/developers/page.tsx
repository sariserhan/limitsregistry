import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../_components/InfoPage";
import { API_V1_PAUSED } from "../../src/api/v1-paused";

import "./developers.css";

export const metadata: Metadata = { title: "API & Data — Limits Registry", description: "A read-only public JSON API for every published record in Limits Registry." };

export default function Page() {
  return <InfoPage kicker="Developers" title="API & Data." intro="A free public record API and a commercial snapshot pilot. Every published record is citable — see the record page for citation formats.">

{API_V1_PAUSED && <p role="status">API access is temporarily paused. This documentation remains available; requests currently return 404.</p>}

<div className="api-options">
  <section className="api-option"><span>Free · No key needed</span><h2>Explore public records.</h2><p>Read published records, accepted claims, and evidence through the JSON API. Up to 100 records per page.</p><a href="#public-api">Start with the public API →</a></section>
  <section className="api-option"><span>Paid · Manually invoiced</span><h2>Download the registry.</h2><p>A consistent bulk snapshot in JSON or NDJSON, with a version identifier for reproducible research and integrations.</p><Link href="/developers/request">Request pilot access →</Link></section>
</div>
<nav className="api-toc" aria-label="API documentation"><a href="#public-api">Public endpoints</a><a href="#snapshots">Snapshot downloads</a><a href="#limits">Limits & caching</a></nav>

<h2>Commercial snapshot pilot</h2>
<p>The registry’s content stays free and open. Paid access buys delivery characteristics, not exclusive rights to registry content. The public detail API already includes specifications, accepted claims, and evidence.</p>
<p>The pilot packages the published registry into a consistent, versioned JSON or NDJSON snapshot. Snapshots are manually published after editorial releases; they are not a live feed and there is no guaranteed update cadence or uptime SLA during the pilot.</p>
<p><Link href="/developers/request">Request pilot access</Link> with your organisation, intended use, and freshness requirements. Pricing and invoicing are agreed directly. There is no self-service checkout or free-key requirement.</p>
<p>Pilot keys apply to snapshot downloads only. Public v1 endpoints retain their existing page limits and do not use keys or monthly quotas.</p>

<h2 id="snapshots">Download a snapshot</h2>
<pre><code>{String.raw`curl -D snapshot.headers \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  'https://www.limitsregistry.com/api/v1/snapshot?format=ndjson' \
  -o registry.ndjson`}</code></pre>
<p><code>format=ndjson</code> is the default: one record per line. <code>format=json</code> returns an array of the same records. Each record includes <code>schemaVersion: 1</code>, the list endpoint’s fields, the current <code>specification</code> (or null), unique accepted <code>claims</code>, and linked <code>evidence</code>. Only OPEN, PROVEN, DISPUTED, and RETIRED records are included.</p>
<p>Claim integer values and rational numerators/denominators are decimal strings to preserve precision. Evidence links use <code>sourceUrl</code>; inclusion of a link does not grant access to or reproduction rights in the linked source. Sources may require a subscription.</p>
<p>Response headers include <code>X-Snapshot-Revision</code> (the SHA-256 of the NDJSON file), <code>X-Snapshot-Schema-Version</code>, <code>X-Snapshot-Generated-At</code> (UTC), <code>X-Snapshot-Record-Count</code>, and a format-specific <code>ETag</code>. Records are ordered by registry number. Save the file and these headers together.</p>
<p>Send the previous response’s <code>ETag</code> in <code>If-None-Match</code> when polling the same format. An unchanged snapshot returns <code>304</code> without starting a download or increasing usage. Use GET; HEAD is not supported. Snapshot responses are private and must not be shared-cached.</p>
<p>Pilot requests are limited to 30 per minute per key, with a 120-per-minute IP protection limit. Conditional requests count toward rate limits. There is no monthly download quota in this pilot. We record download starts per UTC day; interrupted transfers may count, while 304s, rejected requests, and failures opening storage do not.</p>
<ul>
  <li><code>400</code>: unsupported format.</li>
  <li><code>401</code>: supplied key is invalid or revoked. Public endpoints remain accessible without it.</li>
  <li><code>402</code>: a pilot key is required for this endpoint.</li>
  <li><code>429</code>: rate limit exceeded; follow <code>Retry-After</code>.</li>
  <li><code>503</code>: no published snapshot yet, or the service is temporarily unavailable. Retry later.</li>
</ul>

<h2 id="public-api">Public API base URL</h2>
<p><code>https://www.limitsregistry.com/api/v1</code></p>

<h2>List records</h2>
<p><code>GET /api/v1/limits</code></p>
<p>Query parameters: <code>category</code> (optional, exact match), <code>page</code> (default 1), <code>pageSize</code> (default 50, max 100).</p>
<p>Illustrative response (values and totals will change):</p>
<pre><code>{`curl 'https://www.limitsregistry.com/api/v1/limits?category=Mathematics'

{
  "data": [
    {
      "registryNumber": "LR-000072",
      "title": "Chromatic number of the plane",
      "summary": "...",
      "category": "Mathematics",
      "subcategory": "Combinatorics",
      "direction": "MINIMIZE",
      "metricName": "Chromatic number",
      "unit": null,
      "status": "OPEN",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "url": "https://www.limitsregistry.com/limits/LR-000072"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "total": 1
}`}</code></pre>

<h2>Get a single record</h2>
<p><code>GET /api/v1/limits/&#123;registryNumber&#125;</code></p>
<p>Includes the current specification, every accepted Claim, and linked evidence. Returns <code>404</code> if the record doesn&rsquo;t exist or isn&rsquo;t published.</p>
<pre><code>{`curl https://www.limitsregistry.com/api/v1/limits/LR-000072`}</code></pre>

<h2>List categories</h2>
<p><code>GET /api/v1/categories</code></p>
<p>Every category with at least one published record.</p>

<h2>Key security and rotation</h2>
<p>Keep your pilot key on your server, outside browser code and public repositories. The complete key is shown once when issued. To rotate it, request a replacement, update your integration, then have the old key revoked. Revocation blocks subsequent snapshot requests; public record access remains free.</p>
<p>API purchases do not influence editorial decisions, verification, or record placement.</p>

<h2>Other formats</h2>
<p>Beyond the JSON API: an embeddable SVG status badge at <code>/api/badge/&#123;registryNumber&#125;</code>, a BibTeX citation per record (see the record page), and RSS feeds for the <Link href="/breakthroughs">breakthroughs</Link> and <a href="/watchlists">watchlist</a> feeds.</p>

<h2 id="limits">Public API rate limits and caching</h2>
<p>No API key and no hard rate limit today &mdash; please cache client-side rather than polling in a tight loop. Record endpoints configure a 60-second shared-cache lifetime and up to 300 seconds of stale-while-revalidate; categories use 300 and 3,600 seconds respectively; responses may lag recent edits. This is a best-effort read-only mirror of the public site, not a guaranteed-uptime service; these public record endpoints require no authentication and do not allow writes.</p>

<h2>Operational monitoring</h2>
<p>We aggregate requests reaching our API servers by endpoint, status, hour, and resolved pilot key. Short-lived, daily rotating client identifiers help detect repeated failures. Monitoring excludes CDN cache hits and does not change download accounting. See our <Link href="/privacy">privacy policy</Link>.</p>

</InfoPage>; }
