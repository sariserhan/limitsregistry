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

const REGISTRY_NUMBER = "LR-BEAL";
const SOURCE_URL = "https://en.wikipedia.org/wiki/Beal_conjecture";
const AMS_PRIZE_URL = "https://www.ams.org/profession/prizes-awards/ams-supported/beal-prize";
const TITLE = "Beal conjecture";
const FORMAL_STATEMENT = "If A^x + B^y = C^z, where A, B, C, x, y, and z are positive integers with x, y, z > 2, then A, B, and C have a common prime factor.";
const SUMMARY = "Andrew Beal formulated this conjecture in 1993 while investigating generalizations of Fermat's Last Theorem. It asks whether every solution to A^x + B^y = C^z with all exponents greater than 2 forces A, B, and C to share a common prime factor — equivalently, that the equation has no solutions in pairwise-coprime positive integers under those exponents. It remains open and unproven.";

// Mirrors scripts/seed-beal-conjecture.ts — run at request time so it reaches production's
// Sensitive DATABASE_URL, same pattern as the other one-off /api/admin/seed-* endpoints.
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.execute<{ id: string }>(sql`select id from limits where registry_number = ${REGISTRY_NUMBER} limit 1`);
  let limitId: string;
  let limitAction: string;
  if (existing.length) {
    limitId = existing[0].id;
    await db.execute(sql`update limits set summary = ${SUMMARY}, updated_at = now() where id = ${limitId}`);
    limitAction = "updated existing limit";
  } else {
    const [limit] = await db.execute<{ id: string }>(sql`
      insert into limits (registry_number, slug, title, summary, category, subcategory, direction, metric_name, status)
      values (${REGISTRY_NUMBER}, ${"beal-conjecture"}, ${TITLE}, ${SUMMARY}, ${"Mathematics"}, ${"Number Theory"}, ${"MAXIMIZE"}, ${"Existence of a counterexample"}, ${"OPEN"})
      returning id
    `);
    limitId = limit.id;
    await db.execute(sql`
      insert into limit_spec_versions (limit_id, version_number, formal_statement, constraints, assumptions)
      values (${limitId}, 1, ${FORMAL_STATEMENT}, ${JSON.stringify({ exponents: "x, y, z > 2", integers: "A, B, C, x, y, z positive integers" })}::jsonb, ${JSON.stringify({ publicationProcess: "FOUNDING_CATALOG_IMPORT" })}::jsonb)
    `);
    await db.execute(sql`
      insert into evidence (type, label, url, limit_id, metadata)
      values (${"PAPER"}, ${"Beal conjecture — background and statement"}, ${SOURCE_URL}, ${limitId}, ${JSON.stringify({ verificationLevel: "SOURCE_CONFIRMED" })}::jsonb)
    `);
    limitAction = "published new limit";
  }

  const existingBounty = await db.execute<{ id: string }>(sql`select id from research_bounties where limit_id = ${limitId} and sponsor = ${"Andrew Beal"} limit 1`);
  let bountyAction: string;
  if (existingBounty.length) {
    bountyAction = "already existed, no changes";
  } else {
    await db.execute(sql`
      insert into research_bounties (limit_id, title, sponsor, description, source_url, status, amount, currency, moderation_note, verified_at)
      values (
        ${limitId}, ${"Beal Prize"}, ${"Andrew Beal"},
        ${"A $1,000,000 prize for a proof or a counterexample of the Beal conjecture, funded by Andrew Beal and held in trust by the American Mathematical Society. Offered since 1997, raised in stages to its current amount in 2013; still unclaimed."},
        ${AMS_PRIZE_URL}, ${"VERIFIED"}, ${"1000000.00"}, ${"USD"},
        ${"Verified against the AMS's own Beal Prize program page: sponsor, amount, and administering body confirmed."},
        now()
      )
    `);
    bountyAction = "published verified bounty";
  }

  const [{ verifiedBountyCount }] = await db.execute<{ verifiedBountyCount: number }>(sql`select count(*)::int as "verifiedBountyCount" from research_bounties where status = 'VERIFIED'`);
  return NextResponse.json({ status: "ok", limitAction, bountyAction, verifiedBountyCount });
}
