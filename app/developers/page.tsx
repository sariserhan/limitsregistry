import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "API — Limits Registry", description: "A read-only public JSON API for every published record in Limits Registry." };

export default function Page() { return <InfoPage kicker="Developers" title="API." intro="Read-only, no key required. The same published data the site itself renders, as JSON. Every published record here is also citable — see the record page for citation formats.">

<h2>Base URL</h2>
<p><code>https://www.limitsregistry.com/api/v1</code></p>

<h2>List records</h2>
<p><code>GET /api/v1/limits</code></p>
<p>Query parameters: <code>category</code> (optional, exact match), <code>page</code> (default 1), <code>pageSize</code> (default 50, max 100).</p>
<pre><code>{`curl https://www.limitsregistry.com/api/v1/limits?category=Mathematics

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

<h2>Other formats</h2>
<p>Beyond the JSON API: an embeddable SVG status badge at <code>/api/badge/&#123;registryNumber&#125;</code>, a BibTeX citation per record (see the record page), and RSS feeds for the <a href="/breakthroughs">breakthroughs</a> and <a href="/watchlists">watchlist</a> feeds.</p>

<h2>Rate limits and caching</h2>
<p>No API key and no hard rate limit today &mdash; please cache client-side (responses carry <code>Cache-Control</code>, refreshed at most once a minute) rather than polling in a tight loop. This is a best-effort read-only mirror of the public site, not a guaranteed-uptime service; nothing here requires authentication, and nothing here lets you write.</p>

</InfoPage>; }
