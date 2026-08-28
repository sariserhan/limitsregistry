/** Publishes kissing number bounds by dimension (1-24), sourced from the standard sphere-packing literature. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const SOURCE_URL = "https://en.wikipedia.org/wiki/Kissing_number";
const PAPER_TITLE = "Kissing number bounds by dimension";

// Kissing number: the maximum number of non-overlapping unit spheres that can simultaneously touch
// a central unit sphere in n-dimensional Euclidean space. exact === null means only bounds are known.
const RECORDS: Array<{ dim: number; exact: number | null; lower: number; upper: number; proof?: string }> = [
  { dim: 1, exact: 2, lower: 2, upper: 2 },
  { dim: 2, exact: 6, lower: 6, upper: 6 },
  { dim: 3, exact: 12, lower: 12, upper: 12, proof: "Schütte and van der Waerden, 1953" },
  { dim: 4, exact: 24, lower: 24, upper: 24, proof: "Oleg Musin, 2003" },
  { dim: 5, exact: null, lower: 40, upper: 44 },
  { dim: 6, exact: null, lower: 72, upper: 77 },
  { dim: 7, exact: null, lower: 126, upper: 134 },
  { dim: 8, exact: 240, lower: 240, upper: 240, proof: "E8 lattice" },
  { dim: 9, exact: null, lower: 306, upper: 363 },
  { dim: 10, exact: null, lower: 510, upper: 553 },
  { dim: 11, exact: null, lower: 604, upper: 868 },
  { dim: 12, exact: null, lower: 841, upper: 1355 },
  { dim: 13, exact: null, lower: 1154, upper: 2064 },
  { dim: 14, exact: null, lower: 1932, upper: 3174 },
  { dim: 15, exact: null, lower: 2564, upper: 4853 },
  { dim: 16, exact: null, lower: 4320, upper: 7320 },
  { dim: 17, exact: null, lower: 5730, upper: 10978 },
  { dim: 18, exact: null, lower: 7654, upper: 16406 },
  { dim: 19, exact: null, lower: 11948, upper: 24417 },
  { dim: 20, exact: null, lower: 19448, upper: 36195 },
  { dim: 21, exact: null, lower: 29768, upper: 53524 },
  { dim: 22, exact: null, lower: 49896, upper: 80810 },
  { dim: 23, exact: null, lower: 93150, upper: 122351 },
  { dim: 24, exact: 196560, lower: 196560, upper: 196560, proof: "Leech lattice" },
];

let inserted = 0, skipped = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${PAPER_TITLE} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,venue,publisher_url) values (${PAPER_TITLE},${"Best known lower and upper bounds for the kissing number problem across low dimensions, as established across the sphere-packing and semidefinite-programming literature."},${"Sphere-packing and semidefinite-programming literature"},${SOURCE_URL}) returning id`;
  for (const item of RECORDS) {
    // Dimension 8's kissing number duplicates neither LR-DRAFT-E8 nor the earlier static LR-000141
    // fallback record — both of those are sphere-packing DENSITY, a distinct quantity from the count
    // of spheres touching a central one recorded here.
    if (item.dim === 4) continue; // kissing number in 4D is already published as LR-DRAFT-KISSING4.
    const registryNumber = `LR-KISSING-${item.dim}`, slug = `kissing-number-dimension-${item.dim}`;
    if ((await sql`select id from limits where registry_number=${registryNumber} limit 1`).length) { skipped++; continue; }
    const status = item.exact !== null ? "PROVEN" : "OPEN";
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${slug},${`Kissing number in ${item.dim} dimensions`},${`The maximum number of non-overlapping unit spheres that can simultaneously touch a central unit sphere in ${item.dim}-dimensional Euclidean space.`},${"Discrete Geometry"},${"Kissing numbers by dimension"},${"MAXIMIZE"},${"Kissing number"},${status},${new Date("2024-01-01T00:00:00Z")}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Maximum count of non-overlapping unit spheres tangent to a central unit sphere in R^${item.dim}.`},${tx.json({dimension:item.dim,objects:"equal Euclidean spheres"})},${tx.json({publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [evidence] = await tx`insert into evidence (type,label,url,location,metadata) values (${"PAPER"},${`Kissing number bounds — dimension ${item.dim}`},${SOURCE_URL},${`Dimension ${item.dim}`},${tx.json({dimension:item.dim,exact:item.exact,lower:item.lower,upper:item.upper,proof:item.proof ?? null})}) returning id`;
      if (item.exact !== null) {
        const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-KISSING-${item.dim}-EXA`},${spec.id},${"EXACT_VALUE"},${"="},${String(item.exact)},${String(item.exact)},${tx.json({dimension:item.dim})},${"PROVEN"},${"ACCEPTED"},${item.proof ? `Proven optimal via ${item.proof}.` : "Proven optimal by exhaustive case analysis."}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
      } else {
        const [lower] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-KISSING-${item.dim}-LB`},${spec.id},${"LOWER_BOUND"},${">="},${String(item.lower)},${String(item.lower)},${tx.json({dimension:item.dim})},${"PROVEN"},${"ACCEPTED"},${"Established by an explicit lattice or packing construction."}) returning id`;
        const [upper] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-KISSING-${item.dim}-UB`},${spec.id},${"UPPER_BOUND"},${"<="},${String(item.upper)},${String(item.upper)},${tx.json({dimension:item.dim})},${"PROVEN"},${"ACCEPTED"},${"Established via semidefinite-programming linear-programming bounds."}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${lower.id},${evidence.id}),(${upper.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${lower.id},${paper.id}),(${upper.id},${paper.id})`;
      }
      await tx`insert into timeline_events (limit_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${"REGISTRY_PUBLICATION"},${"Published from the kissing number literature"},${item.exact !== null ? `Kissing number in dimension ${item.dim} is exactly ${item.exact}.` : `Best known bounds: ${item.lower} <= kissing number <= ${item.upper} in dimension ${item.dim}.`},${new Date("2024-01-01T00:00:00Z")},${tx.json({batch:"KISSING_NUMBERS",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:SOURCE_URL})})`;
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, skipped, publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
