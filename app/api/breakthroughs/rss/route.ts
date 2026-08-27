import { listRecentBreakthroughEvents } from "../../../../src/db/repository.breakthroughs";
export const runtime = "nodejs";
export const revalidate = 300;
const xml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export async function GET() {
  const events = await listRecentBreakthroughEvents(50);
  const items = events.map(({ event, claimNumber, relation, valueExact, limit }) => {
    const detail = claimNumber ? `${claimNumber} ${relation} ${valueExact}` : "Accepted Claim";
    return `<item><title>${xml(`${limit.registryNumber} — ${event.eventType}`)}</title><description>${xml(`${limit.title}: ${detail}`)}</description><link>https://www.limitsregistry.com/limits/${xml(limit.registryNumber)}</link><pubDate>${event.occurredAt.toUTCString()}</pubDate><guid>${event.id}</guid></item>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Breakthroughs — Limits Registry</title><link>https://www.limitsregistry.com/breakthroughs</link><description>Recently accepted stronger bounds, constructions, and frontier closures across the Registry.</description>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" } });
}
