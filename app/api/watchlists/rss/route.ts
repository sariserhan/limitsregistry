import { getPublishedLimit } from "../../../../src/db/repository";
import { listWatchlistEvents } from "../../../../src/db/repository.research";
export const runtime = "nodejs"; export const revalidate = 300;
const xml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export async function GET(request: Request) { const limitId = new URL(request.url).searchParams.get("limitId"); if (!limitId) return new Response("limitId is required", { status: 400 }); const limit = await getPublishedLimit(limitId); if (!limit) return new Response("Not found", { status: 404 });
  const limitUrl = `https://www.limitsregistry.com/limits/${xml(limit.registryNumber)}`;
  const events = await listWatchlistEvents(limit.id);
  // guid is a bare UUID, not a URL — isPermaLink defaults to true per the RSS 2.0 spec, so without
  // isPermaLink="false" a validator or reader treats a non-URL guid as an invalid permalink.
  const items = events.map(e => `<item><title>${xml(e.eventType)}</title><description>${xml(JSON.stringify(e.payload))}</description><link>${limitUrl}#timeline</link><pubDate>${e.createdAt.toUTCString()}</pubDate><guid isPermaLink="false">${e.id}</guid></item>`).join("");
  const feedUrl = `https://www.limitsregistry.com/api/watchlists/rss?limitId=${xml(limit.registryNumber)}`;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(limit.title)} — Limits Registry</title><link>${limitUrl}</link><atom:link href="${feedUrl}" rel="self" type="application/rss+xml" /><description>Published research events for ${xml(limit.title)}</description>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" } }); }
