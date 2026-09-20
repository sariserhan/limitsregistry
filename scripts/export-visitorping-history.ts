import { readFile, writeFile } from "node:fs/promises";
import { parse } from "dotenv";
import { fetchVisitorPingHistory } from "../src/analytics/visitorping-history";

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(["--site-id", "--to", "--output"]);
  const options = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed.has(args[i]) || !args[i + 1] || options.has(args[i])) throw new Error("Usage: tsx scripts/export-visitorping-history.ts --site-id ID [--to YYYY-MM-DD] [--output FILE]");
    options.set(args[i], args[i + 1]);
  }
  const local = parse(await readFile(".env.local"));
  const apiKey = process.env.VISITORPING_API_SECRET || local.VISITORPING_API_SECRET;
  const siteId = options.get("--site-id") || process.env.VISITORPING_SITE_ID || local.VISITORPING_SITE_ID;
  if (!apiKey || !siteId) throw new Error("Set VISITORPING_API_SECRET and provide --site-id or VISITORPING_SITE_ID. The tracker public ID may differ from the internal site ID.");
  const to = options.get("--to") || "2026-09-19";
  // New local counters started on Sep 20. Never silently export an overlapping range.
  if (to >= "2026-09-20") throw new Error("The historical cutoff must precede the live-counter start date, 2026-09-20.");
  const history = await fetchVisitorPingHistory({ siteId, apiKey, to });
  const output = options.get("--output") || "/private/tmp/limitsregistry-visitorping-history.json";
  await writeFile(output, JSON.stringify(history, null, 2), { mode: 0o600, flag: "wx" });
  const limitRows = history.rows.filter(row => /^\/limits\/[^/]+$/.test(row.path));
  const categoryRows = history.rows.filter(row => /^\/categories\/[^/]+$/.test(row.path));
  console.log(JSON.stringify({ output, site: history.site, to, traffic: history.traffic, pages: history.rows.length, limitPages: limitRows.length, categoryPages: categoryRows.length, example: history.rows.find(row => row.path === "/limits/LR-003318") || null, imported: false }, null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "VisitorPing export failed."); process.exitCode = 1; });
