import { readFile, writeFile } from "node:fs/promises";
import { parse } from "dotenv";
import { discoverVisitorPingSite, fetchVisitorPingHistory } from "../src/analytics/visitorping-history";

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(["--site-id", "--from", "--to", "--output"]);
  const options = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed.has(args[i]) || !args[i + 1] || options.has(args[i])) throw new Error("Usage: tsx scripts/export-visitorping-history.ts [--site-id ID] [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--output FILE]");
    options.set(args[i], args[i + 1]);
  }
  const local = parse(await readFile(".env.local"));
  const apiKey = process.env.VISITORPING_API_SECRET || local.VISITORPING_API_SECRET;
  if (!apiKey) throw new Error("Set VISITORPING_API_SECRET.");
  const discovered = await discoverVisitorPingSite(apiKey);
  const requested = options.get("--site-id") || process.env.VISITORPING_SITE_ID || local.VISITORPING_SITE_ID;
  if (requested && requested !== discovered.id && requested !== discovered.siteKey) throw new Error("Requested site does not match the discovered Limits Registry site.");
  const siteId = discovered.id;
  const to = options.get("--to") || "2026-09-19";
  // Later dates are useful for read-only audits, but cannot be added to live totals.
  const history = await fetchVisitorPingHistory({ siteId, apiKey, from: options.get("--from"), to });
  const output = options.get("--output") || "/private/tmp/limitsregistry-visitorping-history.json";
  await writeFile(output, JSON.stringify(history, null, 2), { mode: 0o600, flag: "wx" });
  const limitRows = history.rows.filter(row => /^\/limits\/[^/]+$/.test(row.path));
  const categoryRows = history.rows.filter(row => /^\/categories\/[^/]+$/.test(row.path));
  console.log(JSON.stringify({ output, site: history.site, from: history.from, to, requests: history.generatedAt.length, pages: history.rows.length, views: history.rows.reduce((sum, row) => sum + row.views, 0), topPages: history.rows.slice(0, 5), homepage: history.rows.find(row => row.path === "/") || null, limitPages: limitRows.length, categoryPages: categoryRows.length, example: history.rows.find(row => row.path === "/limits/LR-003318") || null, overlapsLiveCounters: to >= "2026-09-20", imported: false }, null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "VisitorPing export failed."); process.exitCode = 1; });
