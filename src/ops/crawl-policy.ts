/**
 * Limits Registry's owner-approved access policy. Public notices must survive
 * an unavailable configuration/billing database. This standalone module is
 * also copied unchanged to the Limits Registry origin for the same documents.
 */
export const LIMITSREGISTRY_POLICY_VERSION = "limitsregistry-crawl-2026-10-24-v1";
export const LIMITSREGISTRY_POLICY_URL = "https://www.limitsregistry.com/crawl-policy";
const ENROLL = "https://visitorping.com/crawl-access/limitsregistry";

export const LIMITSREGISTRY_LICENSE = `<?xml version="1.0" encoding="UTF-8"?>
<rsl xmlns="https://rslstandard.org/rsl">
  <content url="https://www.limitsregistry.com/">
    <license>
      <permits type="usage">ai-train ai-input ai-index search</permits>
      <payment type="crawl">
        <amount currency="USD">0.01</amount>
        <custom>${LIMITSREGISTRY_POLICY_URL}</custom>
      </payment>
    </license>
  </content>
</rsl>
`;

// Keep the site's existing exclusions. A robots Allow is crawl discovery,
// not permission to skip enrollment or the payment terms in the license.
export const LIMITSREGISTRY_ROBOTS = `# Automated page access: ${LIMITSREGISTRY_POLICY_URL}
# Read the license and enroll before crawling page content.
User-agent: *
Allow: /
Disallow: /api/
Disallow: /developers
Disallow: /admin/
Disallow: /console/
Disallow: /login
Disallow: /signup
Disallow: /account
Disallow: /submit
Disallow: /watchlists
Disallow: /reviewer-profile
Disallow: /forgot-password
Disallow: /reset-password

Sitemap: https://www.limitsregistry.com/sitemap.xml
License: https://www.limitsregistry.com/license.xml
`;

export const LIMITSREGISTRY_POLICY_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Automated access policy — Limits Registry</title><link rel="canonical" href="${LIMITSREGISTRY_POLICY_URL}">
<style>body{font:17px/1.65 system-ui,sans-serif;color:#192b32;background:#f5f7f6;margin:0}main{max-width:740px;margin:48px auto;padding:32px;background:#fff;border:1px solid #dbe3de;border-radius:12px}h1{line-height:1.2}h2{font-size:1.2em;margin-top:28px}a{color:#176247}small{color:#4b6258}@media(max-width:800px){main{margin:16px;padding:22px}}</style></head>
<body><main><nav><a href="/">Limits Registry</a> · <a href="/terms">Terms of use</a></nav>
<h1>Automated access policy</h1><p><small>Published October 24, 2026 (UTC). Version ${LIMITSREGISTRY_POLICY_VERSION}. Applies to requests after publication.</small></p>
<p>Automated access to page content, including AI training collection, search indexing and assistant retrieval, requires enrollment and an active crawler credential. Ordinary human browsing, linking and citation remain free.</p>
<h2>One cent per successful page</h2><p>The monthly billing option costs <strong>USD $0.01 per successful HTML page GET</strong>. Usage is collected monthly or when the outstanding balance reaches $100, whichever comes first. There is no fixed monthly access fee. Balances below the payment processor’s minimum carry forward.</p>
<p>Enroll and explicitly authorize payment before using <code>X-VisitorPing-Crawl-Key</code>. A crawler name or user-agent does not enroll you, authorize a charge or create an invoice. Optional prepaid access, when offered during enrollment, uses its separately disclosed terms.</p>
<h2>Free documents and excluded requests</h2><p>This policy, the terms, robots.txt, license.xml and sitemap.xml are free to read. Assets, API requests, redirects and unsuccessful responses do not accrue page charges. The robots Allow directive identifies discoverable pages; automated page access still requires the enrollment described here. Existing private-path restrictions continue to apply.</p>
<h2>Enrollment and retries</h2><p><a href="${ENROLL}">Enroll or check your crawler account</a>. Send your credential only over HTTPS to Limits Registry. Requests without an active credential can receive HTTP 402; repeated unpaid requests can receive HTTP 429. Respect Retry-After and do not bypass access controls.</p>
<p>If enrollment or billing verification is unavailable, pause and retry later. A service outage does not grant free automated access. Successful billing requires an active account and confirmed usage; this notice does not retroactively bill earlier requests.</p>
<h2>Content and scope</h2><p>The <a href="/license.xml">machine-readable license</a> describes automated uses subject to this access policy and payment. Cited third-party material retains its own licenses and rights. This notice does not grant rights we do not control or limit rights provided by applicable law.</p>
<p>Questions: <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a>.</p>
</main></body></html>`;

export function limitsRegistryDocument(pathname: string): { body: string; contentType: string } | null {
  if (pathname === "/license.xml") return { body: LIMITSREGISTRY_LICENSE, contentType: "application/rsl+xml; charset=utf-8" };
  if (pathname === "/robots.txt") return { body: LIMITSREGISTRY_ROBOTS, contentType: "text/plain; charset=utf-8" };
  if (pathname === "/crawl-policy") return { body: LIMITSREGISTRY_POLICY_HTML, contentType: "text/html; charset=utf-8" };
  return null;
}

export function limitsRegistryDocumentResponse(pathname: string, method = "GET"): Response | null {
  if (method !== "GET" && method !== "HEAD") return null;
  const document = limitsRegistryDocument(pathname);
  if (!document) return null;
  return new Response(method === "HEAD" ? null : document.body, {
    headers: {
      "content-type": document.contentType,
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      "x-limitsregistry-policy": LIMITSREGISTRY_POLICY_VERSION,
      link: `<https://www.limitsregistry.com/license.xml>; rel="license", <${LIMITSREGISTRY_POLICY_URL}>; rel="terms-of-service"`,
    },
  });
}
