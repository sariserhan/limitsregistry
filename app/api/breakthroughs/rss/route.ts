import { listRecentBreakthroughEvents } from "../../../../src/db/repository.breakthroughs";
export const runtime = "nodejs";
// force-dynamic, not revalidate: a positive `revalidate` opts a Route Handler into build-time
// prerendering (confirmed via `next build`'s route table — this showed up "○ Static" while every
// other DB-backed route showed "ƒ Dynamic"), which means `next build` executes this query against
// whatever DATABASE_URL the build runs with. On a fresh deploy that's Preview/Production Neon
// before migrations have been applied there, so the build fails with "relation breakthrough_events
// does not exist". The 5-minute cache-control header below already gives the same effective
// freshness window at the CDN/browser layer without coupling the build to live DB schema state.
export const dynamic = "force-dynamic";
const xml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export async function GET() {
  const events = await listRecentBreakthroughEvents(50);
  const items = events.map(({ event, claimNumber, relation, valueExact, limit }) => {
    const detail = claimNumber ? `${claimNumber} ${relation} ${valueExact}` : "Accepted Claim";
    return `<item><title>${xml(`${limit.registryNumber} — ${event.eventType}`)}</title><description>${xml(`${limit.title}: ${detail}`)}</description><link>https://www.limitsregistry.com/limits/${xml(limit.registryNumber)}</link><pubDate>${event.occurredAt.toUTCString()}</pubDate><guid>${event.id}</guid></item>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Breakthroughs — Limits Registry</title><link>https://www.limitsregistry.com/breakthroughs</link><description>Recently accepted stronger bounds, constructions, and frontier closures across the Registry.</description>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" } });
}
