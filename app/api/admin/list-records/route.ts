import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../../../../src/db/client";

export const runtime = "nodejs";
export const maxDuration = 60;

// Read-only inspection endpoint — lets me pull real OPEN/PROVEN record data from production
// (local DATABASE_URL is a separate dev DB) so any content drafted against these records is
// grounded in what's actually published, not invented. Same CRON_SECRET auth pattern as the
// other one-off /api/admin/* routes.
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "OPEN";
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
  const rows = await db.execute(sql`
    select l.registry_number as "registryNumber", l.title, l.category, l.summary, l.direction, l.metric_name as "metricName", l.unit,
      sv.formal_statement as "formalStatement"
    from limits l
    left join lateral (
      select formal_statement from limit_spec_versions where limit_id = l.id order by version_number desc limit 1
    ) sv on true
    where l.status = ${status}
    order by l.registry_number
    limit ${limit}
  `);
  return NextResponse.json({ status, count: rows.length, records: rows });
}
