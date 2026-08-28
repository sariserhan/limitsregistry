/** Publishes minimum comparator counts for optimal sorting networks, n = 1 through 12. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const SOURCE_URL = "https://arxiv.org/abs/1405.5754";
const PAPER_TITLE = "Twenty-Five Comparators is Optimal when Sorting Nine Inputs (and Twenty-Nine for Ten)";

// S(n): the minimum number of comparators in a fixed (data-oblivious) network that sorts every
// n-input sequence. n=1..8 proven by Floyd, 1964. n=9,10 proven by Codish et al., 2014 (cited paper).
// n=11,12: only bounds are known — reuses the exact figures already scaffolded (unpublished) in
// src/domain/research-packets.ts's sortingNetworkResearchPackets. Deliberately stops at n=12: sources
// for n>=13 conflated the sorting-NETWORK size sequence with the unrelated adaptive-comparison-sort
// minimum-comparisons sequence (two different classical problems with similar-looking numbers), and
// this registry does not publish a bound it can't cross-verify.
const RECORDS: Array<{ n: number; exact: number | null; lower: number; upper: number; proof?: string }> = [
  { n: 1, exact: 0, lower: 0, upper: 0, proof: "Trivial" },
  { n: 2, exact: 1, lower: 1, upper: 1, proof: "Floyd, 1964" },
  { n: 3, exact: 3, lower: 3, upper: 3, proof: "Floyd, 1964" },
  { n: 4, exact: 5, lower: 5, upper: 5, proof: "Floyd, 1964" },
  { n: 5, exact: 9, lower: 9, upper: 9, proof: "Floyd, 1964" },
  { n: 6, exact: 12, lower: 12, upper: 12, proof: "Floyd, 1964" },
  { n: 7, exact: 16, lower: 16, upper: 16, proof: "Floyd, 1964" },
  { n: 8, exact: 19, lower: 19, upper: 19, proof: "Floyd, 1964" },
  { n: 9, exact: 25, lower: 25, upper: 25, proof: "Codish, Cruz-Filipe, Frank, Schneider-Kamp, 2014" },
  { n: 10, exact: 29, lower: 29, upper: 29, proof: "Codish, Cruz-Filipe, Frank, Schneider-Kamp, 2014" },
  { n: 11, exact: null, lower: 33, upper: 35 },
  { n: 12, exact: null, lower: 37, upper: 39 },
];

let inserted = 0, updated = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${PAPER_TITLE} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,doi,publisher_url) values (${PAPER_TITLE},${"Proves S(9) = 25 and S(10) = 29 for optimal-size sorting networks, closing the smallest open instances known since 1964."},${"10.1145/2591796.2591834"},${SOURCE_URL}) returning id`;
  for (const item of RECORDS) {
    const registryNumber = `LR-SORTNET-${item.n}`, slug = `sorting-network-${item.n}-inputs`;
    const article = item.n === 8 || item.n === 11 ? "an" : "a";
    const title = `Minimum comparators for ${article} ${item.n}-input sorting network`;
    const existingSN = await sql`select id from limits where registry_number=${registryNumber} limit 1`;
    if (existingSN.length) { await sql`update limits set title=${title},updated_at=now() where id=${existingSN[0].id}`; updated++; continue; }
    const status = item.exact !== null ? "PROVEN" : "OPEN";
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${slug},${title},${`The minimum number of fixed compare-exchange operations needed for a data-oblivious network to sort every possible ordering of ${item.n} inputs.`},${"Algorithms"},${"Sorting networks"},${"MINIMIZE"},${"S(n)"},${status},${new Date("2014-05-01T00:00:00Z")}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`S(${item.n}) is the minimum number of comparators in a fixed network that sorts every ${item.n}-input sequence.`},${tx.json({inputs:item.n,network:"fixed/data-oblivious"})},${tx.json({publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [evidence] = await tx`insert into evidence (type,label,url,location,metadata) values (${"EXHAUSTIVE_COMPUTATION"},${`Sorting network bounds — n=${item.n}`},${SOURCE_URL},${`n = ${item.n}`},${tx.json({inputs:item.n,exact:item.exact,lower:item.lower,upper:item.upper,proof:item.proof ?? null})}) returning id`;
      if (item.exact !== null) {
        const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-SORTNET-${item.n}-EXA`},${spec.id},${"EXACT_VALUE"},${"="},${String(item.exact)},${String(item.exact)},${tx.json({inputs:item.n})},${"PROVEN"},${"ACCEPTED"},${`Proven optimal: ${item.proof}.`}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
      } else {
        const [lower] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-SORTNET-${item.n}-LB`},${spec.id},${"LOWER_BOUND"},${">="},${String(item.lower)},${String(item.lower)},${tx.json({inputs:item.n})},${"PROVEN"},${"ACCEPTED"},${"Maintained sorting-network lower-bound table."}) returning id`;
        const [upper] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-SORTNET-${item.n}-UB`},${spec.id},${"UPPER_BOUND"},${"<="},${String(item.upper)},${String(item.upper)},${tx.json({inputs:item.n})},${"SOURCE_CONFIRMED"},${"ACCEPTED"},${"Best known explicit comparator-network construction."}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${lower.id},${evidence.id}),(${upper.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${lower.id},${paper.id}),(${upper.id},${paper.id})`;
      }
      await tx`insert into timeline_events (limit_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${"REGISTRY_PUBLICATION"},${"Published from the optimal sorting network literature"},${item.exact !== null ? `S(${item.n}) is exactly ${item.exact}.` : `Best known bounds: ${item.lower} <= S(${item.n}) <= ${item.upper}.`},${new Date("2014-05-01T00:00:00Z")},${tx.json({batch:"SORTING_NETWORKS",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:SOURCE_URL})})`;
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, updated, publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
