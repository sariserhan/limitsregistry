import { z } from "zod";

const responseSchema = z.object({
  apiVersion: z.literal("1"),
  site: z.object({ id: z.string(), domain: z.string(), name: z.string().optional() }),
  range: z.object({ from: z.string(), to: z.string(), timezone: z.literal("UTC") }),
  traffic: z.literal("exclude_bots"),
  generatedAt: z.string(),
  data: z.object({ rows: z.array(z.object({ path: z.string().startsWith("/"), pageviews: z.number().int().nonnegative().safe(), days: z.number().int().nonnegative() })), nextCursor: z.string().nullable() }),
});

/** Read-only export. Intentionally does not merge counts into live counters. */
export async function fetchVisitorPingHistory({ siteId, apiKey, to, fetcher = fetch }: { siteId: string; apiKey: string; to: string; fetcher?: typeof fetch }) {
  if (!siteId || !apiKey) throw new Error("VisitorPing site ID and API credential are required.");
  if (!z.iso.date().safeParse(to).success) throw new Error("Use a UTC calendar date (YYYY-MM-DD) for the cutoff.");
  const rows: z.infer<typeof responseSchema>["data"]["rows"] = [];
  const paths = new Set<string>(), cursors = new Set<string>();
  let cursor: string | null = null;
  let site: z.infer<typeof responseSchema>["site"] | undefined;
  const generatedAt: string[] = [];
  do {
    const url = new URL(`https://visitorping.com/api/v1/sites/${encodeURIComponent(siteId)}/pages`);
    url.searchParams.set("from", "1970-01-01"); url.searchParams.set("to", to);
    url.searchParams.set("traffic", "exclude_bots"); url.searchParams.set("limit", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);
    const response = await fetcher(url, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store", signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      if (response.status === 404) throw new Error("VisitorPing site_not_found: supply the internal site ID matching this key.");
      if (response.status === 429) throw new Error(`VisitorPing rate limit reached. Retry after ${response.headers.get("retry-after") || "the provider's cooldown"}; no import was performed.`);
      throw new Error(`VisitorPing returned HTTP ${response.status}; no import was performed.`);
    }
    const result = responseSchema.safeParse(await response.json());
    if (!result.success) throw new Error("Unexpected VisitorPing response shape; no import was performed.");
    const body = result.data;
    if (!["limitsregistry.com", "www.limitsregistry.com"].includes(body.site.domain.toLowerCase())) throw new Error("VisitorPing key is not scoped to Limits Registry.");
    if (body.range.from !== "1970-01-01" || body.range.to !== to) throw new Error("VisitorPing returned an unexpected date range.");
    if (site && body.site.id !== site.id) throw new Error("VisitorPing changed site between pages.");
    site = body.site; generatedAt.push(body.generatedAt);
    for (const row of body.data.rows) {
      if (paths.has(row.path)) throw new Error("VisitorPing returned a duplicate path across pages; retry the export before using totals.");
      paths.add(row.path); rows.push(row);
    }
    cursor = body.data.nextCursor;
    if (cursor) {
      if (cursors.has(cursor) || cursors.size >= 1000) throw new Error("VisitorPing pagination did not terminate safely.");
      cursors.add(cursor);
    }
  } while (cursor !== null);
  return { source: "VisitorPing", site, from: "1970-01-01", to, traffic: "exclude_bots", fetchedAt: new Date().toISOString(), generatedAt, rows };
}
