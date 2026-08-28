/** Publishes small two-color classical Ramsey numbers from Radziszowski's "Small Ramsey Numbers" dynamic survey. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const SURVEY_URL = "https://www.combinatorics.org/ojs/index.php/eljc/article/view/DS1";
const SURVEY_TITLE = "Small Ramsey Numbers";

// R(k,l): least n such that every red/blue edge-coloring of K_n contains a red K_k or a blue K_l.
// exact === null means only bounds are known; values are Table Ia of the survey (revision #16, 2021).
// R(3,3) = 6 is already published as LR-DRAFT-RAMSEY33 in src/domain/research-packets.ts — skipped here.
const RECORDS: Array<{ k: number; l: number; exact: number | null; lower: number; upper: number }> = [
  { k: 3, l: 4, exact: 9, lower: 9, upper: 9 },
  { k: 3, l: 5, exact: 14, lower: 14, upper: 14 },
  { k: 3, l: 6, exact: 18, lower: 18, upper: 18 },
  { k: 3, l: 7, exact: 23, lower: 23, upper: 23 },
  { k: 3, l: 8, exact: 28, lower: 28, upper: 28 },
  { k: 3, l: 9, exact: 36, lower: 36, upper: 36 },
  { k: 4, l: 4, exact: 18, lower: 18, upper: 18 },
  { k: 4, l: 5, exact: 25, lower: 25, upper: 25 },
  { k: 3, l: 10, exact: null, lower: 40, upper: 42 },
  { k: 3, l: 11, exact: null, lower: 47, upper: 50 },
  { k: 3, l: 12, exact: null, lower: 53, upper: 59 },
  { k: 3, l: 13, exact: null, lower: 60, upper: 68 },
  { k: 3, l: 14, exact: null, lower: 67, upper: 77 },
  { k: 3, l: 15, exact: null, lower: 74, upper: 87 },
  { k: 4, l: 6, exact: null, lower: 36, upper: 41 },
  { k: 4, l: 7, exact: null, lower: 49, upper: 61 },
  { k: 4, l: 8, exact: null, lower: 59, upper: 84 },
  { k: 4, l: 9, exact: null, lower: 73, upper: 115 },
  { k: 4, l: 10, exact: null, lower: 92, upper: 149 },
  { k: 5, l: 5, exact: null, lower: 43, upper: 48 },
  { k: 5, l: 6, exact: null, lower: 58, upper: 87 },
  { k: 5, l: 7, exact: null, lower: 80, upper: 143 },
  { k: 5, l: 8, exact: null, lower: 101, upper: 216 },
  { k: 6, l: 6, exact: null, lower: 102, upper: 165 },
  { k: 6, l: 7, exact: null, lower: 115, upper: 298 },
  { k: 7, l: 7, exact: null, lower: 205, upper: 540 },
];

let inserted = 0, skipped = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${SURVEY_TITLE} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,venue,publisher_url) values (${SURVEY_TITLE},${"A continuously updated compilation of known nontrivial values and bounds for small classical, multicolor, and hypergraph Ramsey numbers."},${"The Electronic Journal of Combinatorics, Dynamic Survey DS1"},${SURVEY_URL}) returning id`;
  for (const item of RECORDS) {
    const registryNumber = `LR-RAMSEY-${item.k}-${item.l}`, slug = `ramsey-r-${item.k}-${item.l}`;
    if ((await sql`select id from limits where registry_number=${registryNumber} limit 1`).length) { skipped++; continue; }
    const status = item.exact !== null ? "PROVEN" : "OPEN";
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${slug},${`Ramsey number R(${item.k},${item.l})`},${`The least n such that every red/blue edge-coloring of the complete graph on n vertices contains a red K${item.k} or a blue K${item.l}.`},${"Mathematics"},${"Ramsey numbers / Two-color classical"},${"MINIMIZE"},${`R(${item.k},${item.l})`},${status},${new Date("2021-01-15T00:00:00Z")}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Two-color classical Ramsey number avoiding a red K${item.k} and a blue K${item.l}.`},${tx.json({colors:2,avoidColor1:`K${item.k}`,avoidColor2:`K${item.l}`})},${tx.json({surveyRevision:16,publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [evidence] = await tx`insert into evidence (type,label,url,location,metadata) values (${"PAPER"},${`Small Ramsey Numbers — Table Ia, R(${item.k},${item.l})`},${SURVEY_URL},${"Table Ia"},${tx.json({k:item.k,l:item.l,exact:item.exact,lower:item.lower,upper:item.upper,surveyRevision:16})}) returning id`;
      if (item.exact !== null) {
        const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-RAMSEY-${item.k}-${item.l}-EXA`},${spec.id},${"EXACT_VALUE"},${"="},${String(item.exact)},${String(item.exact)},${tx.json({k:item.k,l:item.l})},${"PROVEN"},${"ACCEPTED"},${"Established by exhaustive search over all critical colorings; see Table Ia of the survey."}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
      } else {
        const [lower] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-RAMSEY-${item.k}-${item.l}-LB`},${spec.id},${"LOWER_BOUND"},${">="},${String(item.lower)},${String(item.lower)},${tx.json({k:item.k,l:item.l})},${"PROVEN"},${"ACCEPTED"},${"Established by an explicit critical coloring construction; see Table Ia of the survey."}) returning id`;
        const [upper] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-RAMSEY-${item.k}-${item.l}-UB`},${spec.id},${"UPPER_BOUND"},${"<="},${String(item.upper)},${String(item.upper)},${tx.json({k:item.k,l:item.l})},${"PROVEN"},${"ACCEPTED"},${"Established by exhaustive or recursive upper-bound computation; see Table Ia of the survey."}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${lower.id},${evidence.id}),(${upper.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${lower.id},${paper.id}),(${upper.id},${paper.id})`;
      }
      await tx`insert into timeline_events (limit_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${"REGISTRY_PUBLICATION"},${"Published from Small Ramsey Numbers, DS1"},${item.exact !== null ? `Matching lower and upper bounds establish R(${item.k},${item.l}) = ${item.exact}.` : `Best known bounds: ${item.lower} <= R(${item.k},${item.l}) <= ${item.upper}.`},${new Date("2021-01-15T00:00:00Z")},${tx.json({batch:"RAMSEY_DS1_R16",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:SURVEY_URL})})`;
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, skipped, publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
