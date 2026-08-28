import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { NEW_BOUNTIES_2026 } from "../../../../src/domain/new-bounties-2026";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// Run at request time so it reaches production's Sensitive DATABASE_URL, same pattern as the
// other one-off /api/admin/seed-* endpoints. Mirrors scripts/seed-new-bounties-2026.ts exactly
// (shared data source: src/domain/new-bounties-2026.ts).
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let published = 0, updated = 0, bountiesPublished = 0, bountiesSkipped = 0;
  for (const b of NEW_BOUNTIES_2026) {
    const existing = await db.execute<{ id: string }>(sql`select id from limits where registry_number = ${b.id} limit 1`);
    let limitId: string;
    if (existing.length) {
      limitId = existing[0].id;
      await db.execute(sql`update limits set summary = ${b.summary}, updated_at = now() where id = ${limitId}`);
      updated++;
    } else {
      const [limit] = await db.execute<{ id: string }>(sql`
        insert into limits (registry_number, slug, title, summary, category, subcategory, direction, metric_name, status)
        values (${b.id}, ${b.id.toLowerCase().replace("lr-", "")}, ${b.title}, ${b.summary}, ${b.category}, ${b.subcategory}, ${"MAXIMIZE"}, ${b.metricName}, ${"OPEN"})
        returning id
      `);
      limitId = limit.id;
      await db.execute(sql`
        insert into limit_spec_versions (limit_id, version_number, formal_statement, constraints, assumptions)
        values (${limitId}, 1, ${b.formalStatement}, ${JSON.stringify({})}::jsonb, ${JSON.stringify({ publicationProcess: "FOUNDING_CATALOG_IMPORT" })}::jsonb)
      `);
      await db.execute(sql`
        insert into evidence (type, label, url, limit_id, metadata)
        values (${"OTHER"}, ${`${b.title} — official competition page`}, ${b.sourceUrl}, ${limitId}, ${JSON.stringify({ verificationLevel: "SOURCE_CONFIRMED" })}::jsonb)
      `);
      published++;
    }

    const existingBounty = await db.execute<{ id: string }>(sql`select id from research_bounties where limit_id = ${limitId} and sponsor = ${b.sponsor} limit 1`);
    if (existingBounty.length) {
      await db.execute(sql`update research_bounties set title = ${b.bountyTitle}, updated_at = now() where id = ${existingBounty[0].id}`);
      bountiesSkipped++;
      continue;
    }
    await db.execute(sql`
      insert into research_bounties (limit_id, title, sponsor, description, source_url, status, amount, currency, expires_at, moderation_note, verified_at)
      values (
        ${limitId}, ${b.bountyTitle}, ${b.sponsor}, ${b.description}, ${b.sourceUrl}, ${"VERIFIED"}, ${b.amount}, ${b.currency},
        ${b.expiresAt}, ${`Verified against the sponsor's own official competition page (${b.sourceUrl}) as active and unclaimed on 2026-08-28.`}, now()
      )
    `);
    bountiesPublished++;
  }

  const [{ verifiedBountyCount }] = await db.execute<{ verifiedBountyCount: number }>(sql`select count(*)::int as "verifiedBountyCount" from research_bounties where status = 'VERIFIED'`);
  return NextResponse.json({ status: "ok", published, updated, bountiesPublished, bountiesSkipped, verifiedBountyCount });
}
