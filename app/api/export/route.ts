import { NextResponse } from "next/server";
import { listPublishedDomainLimits } from "../../../src/db/repository";
import { allowRequest } from "../../../src/ops/rate-limit";
export const runtime = "nodejs";
export const revalidate = 300;
// The client controls every hop it prepends to x-forwarded-for, but not the one the
// nearest reverse proxy (Vercel's edge) appends — that's the last entry in the list.
// Trusting the raw header as-is lets a client change its "IP" on every request and
// bypass the limit entirely.
function clientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const nearestHop = forwardedFor?.split(",").pop()?.trim();
  return nearestHop || "unknown";
}

// Spreadsheet apps treat a leading =, +, -, or @ as a formula even inside a quoted
// CSV cell — prefix with a single quote to neutralize formula injection from
// editor-controlled titles/categories.
function csvCell(value: unknown) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) { if (!(await allowRequest(`export:${clientIp(request)}`))) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 }); try { const data = await listPublishedDomainLimits(); const format = new URL(request.url).searchParams.get("format"); if (format === "csv") { const header = "registryNumber,title,category,status\n"; const rows = data.map(item => [item.id,item.title,item.category,item.status].map(csvCell).join(",")).join("\n"); return new Response(header + rows + "\n", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=limits-registry.csv" } }); } if (format === "bibtex") { const bibtex = data.map((item) => "@misc{" + item.id.toLowerCase() + ",\n  title = {" + item.title.replace(/[{}]/g, "") + "},\n  howpublished = {Limits Registry},\n  url = {https://limitsregistry.com/limits/" + item.id + "},\n  note = {" + item.category + "; status: " + item.status + "}\n}").join("\n"); return new Response(bibtex + "\n", { headers: { "content-type": "application/x-bibtex; charset=utf-8", "content-disposition": "attachment; filename=limits-registry.bib" } }); } return NextResponse.json({ data, generatedAt: new Date().toISOString() }, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } }); } catch { return NextResponse.json({ error: "Registry export unavailable." }, { status: 503 }); } }
