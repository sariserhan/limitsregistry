/** Publishes the Beal Conjecture as an open Limit and attaches its real, verified $1M prize. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const REGISTRY_NUMBER = "LR-BEAL";
const SOURCE_URL = "https://en.wikipedia.org/wiki/Beal_conjecture";
const AMS_PRIZE_URL = "https://www.ams.org/profession/prizes-awards/ams-supported/beal-prize";
const TITLE = "Beal conjecture";
const FORMAL_STATEMENT = "If A^x + B^y = C^z, where A, B, C, x, y, and z are positive integers with x, y, z > 2, then A, B, and C have a common prime factor.";
const SUMMARY = "Andrew Beal formulated this conjecture in 1993 while investigating generalizations of Fermat's Last Theorem. It asks whether every solution to A^x + B^y = C^z with all exponents greater than 2 forces A, B, and C to share a common prime factor — equivalently, that the equation has no solutions in pairwise-coprime positive integers under those exponents. It remains open and unproven.";

async function main() { try {
  const existing = await sql`select id from limits where registry_number=${REGISTRY_NUMBER} limit 1`;
  let limitId: string;
  if (existing.length) {
    limitId = existing[0].id;
    await sql`update limits set summary=${SUMMARY},updated_at=now() where id=${limitId}`;
    console.log("limit already existed, updated summary:", REGISTRY_NUMBER);
  } else {
    const [limit] = await sql`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status) values (${REGISTRY_NUMBER},${"beal-conjecture"},${TITLE},${SUMMARY},${"Mathematics"},${"Number Theory"},${"MAXIMIZE"},${"Existence of a counterexample"},${"OPEN"}) returning id`;
    limitId = limit.id;
    await sql`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limitId},1,${FORMAL_STATEMENT},${sql.json({ exponents: "x, y, z > 2", integers: "A, B, C, x, y, z positive integers" })},${sql.json({ publicationProcess: "FOUNDING_CATALOG_IMPORT" })})`;
    await sql`insert into evidence (type,label,url,limit_id,metadata) values (${"PAPER"},${"Beal conjecture — background and statement"},${SOURCE_URL},${limitId},${sql.json({ verificationLevel: "SOURCE_CONFIRMED" })})`;
    console.log("published new limit:", REGISTRY_NUMBER);
  }

  const existingBounty = await sql`select id from research_bounties where limit_id=${limitId} and sponsor=${"Andrew Beal"} limit 1`;
  if (existingBounty.length) {
    console.log("bounty already exists for", REGISTRY_NUMBER, "— no changes made.");
  } else {
    await sql`insert into research_bounties (limit_id,title,sponsor,description,source_url,status,amount,currency,moderation_note,verified_at) values (${limitId},${"Beal Prize"},${"Andrew Beal"},${"A $1,000,000 prize for a proof or a counterexample of the Beal conjecture, funded by Andrew Beal and held in trust by the American Mathematical Society. Offered since 1997, raised in stages to its current amount in 2013; still unclaimed."},${AMS_PRIZE_URL},${"VERIFIED"},${"1000000.00"},${"USD"},${"Verified against the AMS's own Beal Prize program page: sponsor, amount, and administering body confirmed."},${sql`now()`})`;
    console.log("published verified bounty for", REGISTRY_NUMBER);
  }

  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from research_bounties where status='VERIFIED'`;
  console.log(JSON.stringify({ verifiedBountyCount: publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
