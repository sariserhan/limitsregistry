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
  const email = searchParams.get("email");
  if (email) {
    const rows = await db.execute(sql`select id, name, email, role from "user" where email = ${email} limit 1`);
    return NextResponse.json({ user: rows[0] ?? null });
  }
  const registryNumber = searchParams.get("registryNumber");
  if (registryNumber) {
    const [limitRow] = await db.execute(sql`select id, registry_number as "registryNumber", title, category, subcategory, status, direction, metric_name as "metricName", unit, summary from limits where registry_number = ${registryNumber} limit 1`);
    if (!limitRow) return NextResponse.json({ limit: null });
    const specs = await db.execute(sql`select id, version_number as "versionNumber", formal_statement as "formalStatement" from limit_spec_versions where limit_id = ${limitRow.id} order by version_number desc`);
    const claimRows = await db.execute(sql`select c.id, c.claim_number as "claimNumber", c.claim_type as "claimType", c.relation, c.value_exact as "valueExact", c.unit, c.status, c.epistemic_status as "epistemicStatus" from claims c join limit_spec_versions sv on sv.id = c.specification_version_id where sv.limit_id = ${limitRow.id}`);
    return NextResponse.json({ limit: limitRow, specs, claims: claimRows });
  }
  const timelineFor = searchParams.get("timelineFor");
  if (timelineFor) {
    const registryNumbers = timelineFor.split(",");
    const condition = sql.join(registryNumbers.map((n) => sql`${n}`), sql` , `);
    const rows = await db.execute(sql`
      select l.registry_number as "registryNumber", te.title, te.description
      from limits l
      join timeline_events te on te.limit_id = l.id
      where l.registry_number in (${condition})
      order by l.registry_number, te.occurred_at
    `);
    return NextResponse.json({ events: rows });
  }
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
