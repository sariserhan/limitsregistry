import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../../../../src/db/client";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// One-off correction: every CODATA record (registry_number LIKE 'LR-001%') was seeded with
// status OPEN whenever its value wasn't SI-exact, but OPEN on this Registry specifically means a
// real, unclosed gap between an achievable and an impossibility frontier — a single published
// reference value with a stated measurement uncertainty isn't that kind of record at all, and the
// record's own page already says so ("A published value under the current specification, not two
// opposing bounds."). The exact/measured distinction stays correctly carried by each claim's
// epistemic_status (PROVEN vs SOURCE_CONFIRMED) and the presentation-layer label it drives ("Exact
// defined value" vs "Recommended reference value") — only the top-level Limit.status was wrong.
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const before = await db.execute<{ count: number }>(sql`select count(*)::int as count from limits where registry_number like 'LR-001%' and status = 'OPEN'`);
  const fixedRows = await db.execute<{ id: string }>(sql`update limits set status = 'PROVEN', updated_at = now() where registry_number like 'LR-001%' and status = 'OPEN' returning id`);
  await db.execute(sql`
    insert into audit_logs (action, entity_type, entity_id, before, after, reason)
    values ('CODATA_TAXONOMY_STATUS_CORRECTED', 'BATCH', 'LR-001%', ${JSON.stringify({ status: "OPEN", affected: before[0]?.count ?? 0 })}::jsonb, ${JSON.stringify({ status: "PROVEN", affected: fixedRows.length })}::jsonb, 'CODATA reference values do not represent an achievable-vs-impossibility gap; corrected from OPEN to PROVEN to match the Registry''s own status semantics.')
  `);

  return NextResponse.json({ before: before[0]?.count ?? 0, fixed: fixedRows.length });
}
