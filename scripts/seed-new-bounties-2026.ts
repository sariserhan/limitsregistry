/** Publishes three new real, verified bounties tied to genuine open technical/scientific
 *  frontiers, on top of the existing Millennium Problems + Beal Prize batch. Data lives in
 *  src/domain/new-bounties-2026.ts, shared with app/api/admin/seed-new-bounties-2026/route.ts
 *  (the version that actually reaches production). Mirrors scripts/seed-millennium-problems.ts's
 *  structure: Limit + spec + evidence + bounty, no claim (there is no accepted quantitative
 *  result to cite honestly — these are open competitions, not proven bounds). */
import "dotenv/config";
import postgres from "postgres";
import { NEW_BOUNTIES_2026 } from "../src/domain/new-bounties-2026";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

async function main() { try {
  let published = 0, updated = 0, bountiesPublished = 0, bountiesSkipped = 0;
  for (const b of NEW_BOUNTIES_2026) {
    const existing = await sql`select id from limits where registry_number=${b.id} limit 1`;
    let limitId: string;
    if (existing.length) {
      limitId = existing[0].id;
      await sql`update limits set summary=${b.summary},updated_at=now() where id=${limitId}`;
      updated++;
    } else {
      const [limit] = await sql`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status) values (${b.id},${b.id.toLowerCase().replace("lr-", "")},${b.title},${b.summary},${b.category},${b.subcategory},${"MAXIMIZE"},${b.metricName},${"OPEN"}) returning id`;
      limitId = limit.id;
      await sql`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limitId},1,${b.formalStatement},${sql.json({})},${sql.json({ publicationProcess: "FOUNDING_CATALOG_IMPORT" })})`;
      await sql`insert into evidence (type,label,url,limit_id,metadata) values (${"OTHER"},${`${b.title} — official competition page`},${b.sourceUrl},${limitId},${sql.json({ verificationLevel: "SOURCE_CONFIRMED" })})`;
      published++;
    }

    const existingBounty = await sql`select id from research_bounties where limit_id=${limitId} and sponsor=${b.sponsor} limit 1`;
    if (existingBounty.length) {
      await sql`update research_bounties set title=${b.bountyTitle},updated_at=now() where id=${existingBounty[0].id}`;
      bountiesSkipped++; continue;
    }
    await sql`insert into research_bounties (limit_id,title,sponsor,description,source_url,status,amount,currency,expires_at,moderation_note,verified_at) values (${limitId},${b.bountyTitle},${b.sponsor},${b.description},${b.sourceUrl},${"VERIFIED"},${b.amount},${b.currency},${b.expiresAt},${`Verified against the sponsor's own official competition page (${b.sourceUrl}) as active and unclaimed on 2026-08-28.`},${sql`now()`})`;
    bountiesPublished++;
  }
  const [{ verifiedBountyCount }] = await sql`select count(*)::int as "verifiedBountyCount" from research_bounties where status='VERIFIED'`;
  console.log(JSON.stringify({ published, updated, bountiesPublished, bountiesSkipped, verifiedBountyCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
