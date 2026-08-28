/** Publishes the official MIPLIB 2017 v36 proven-optimal benchmark subset as a founding source catalog. */
import "dotenv/config";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { MIPLIB_BENCHMARK_URL, MIPLIB_PAPER_URL, MIPLIB_RELEASE_DATE, MIPLIB_SOLUTION_URL, miplibInstanceUrl, miplibRegistryNumber, miplibSlug, provenMiplibBenchmark } from "../src/catalog/miplib";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });
const records = provenMiplibBenchmark(readFileSync(new URL("../data/miplib2017-v36.solu", import.meta.url), "utf8"), readFileSync(new URL("../data/miplib-benchmark-v2.test", import.meta.url), "utf8"));
const paperTitle = "MIPLIB 2017: Data-Driven Compilation of the 6th Mixed-Integer Programming Library";
const summaryFor = (instance: string) => `MIPLIB is the standard benchmark library for mixed-integer programming — optimization problems over both continuous and integer-valued variables, used across logistics, scheduling, and engineering. This record cites the proven optimal objective value for the canonical benchmark instance ${instance}, according to version 36 of the official solution catalog.`;

let inserted = 0, updated = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${paperTitle} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,publication_date,venue,doi,publisher_url) values (${paperTitle},${"The official MIPLIB 2017 benchmark methodology, instance collection, solution validation, and versioned optimal objective catalog."},${new Date("2021-12-01T00:00:00Z")},${"Mathematical Programming Computation"},${"10.1007/s12532-020-00194-3"},${MIPLIB_PAPER_URL}) returning id`;
  for (let index = 0; index < records.length; index++) {
    const item = records[index], registryNumber = miplibRegistryNumber(index), instanceUrl = miplibInstanceUrl(item.instance);
    const existingMiplib = await sql`select id from limits where registry_number=${registryNumber} or slug=${miplibSlug(item.instance)} limit 1`;
    if (existingMiplib.length) { await sql`update limits set summary=${summaryFor(item.instance)},updated_at=now() where id=${existingMiplib[0].id}`; updated++; continue; }
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${miplibSlug(item.instance)},${`MIPLIB optimal objective — ${item.instance}`},${summaryFor(item.instance)},${"Computing"},${"Mixed-integer optimization / MIPLIB 2017"},${"MINIMIZE"},${"Objective value"},${"PROVEN"},${MIPLIB_RELEASE_DATE}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Minimize the objective of the canonical MIPLIB 2017 benchmark model ${item.instance}.`},${tx.json({instance:item.instance,benchmarkVersion:2,solutionCatalogVersion:36,modelUrl:instanceUrl,objectiveSense:"MINIMIZE"})},${tx.json({numericalInterpretation:"Use the official MIPLIB model, feasibility tolerances, solution checker, and published objective value.",publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [lower] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-MIPLIB-${String(index+1).padStart(4,"0")}-LB`},${spec.id},${"LOWER_BOUND"},${">="},${item.objective},${item.objective},${tx.json({instance:item.instance,catalogVersion:36})},${"PROVEN"},${"ACCEPTED"},${"Official MIPLIB optimality status establishes that no feasible solution has a better minimization objective."}) returning id`;
      const [upper] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-MIPLIB-${String(index+1).padStart(4,"0")}-UB`},${spec.id},${"UPPER_BOUND"},${"<="},${item.objective},${item.objective},${tx.json({instance:item.instance,catalogVersion:36})},${"SOURCE_CONFIRMED"},${"ACCEPTED"},${"A feasibility-checked MIPLIB solution attains the published objective value."}) returning id`;
      const evidenceRows = await tx`insert into evidence (type,label,url,location,metadata) values (${"EXHAUSTIVE_COMPUTATION"},${`MIPLIB v36 optimality record — ${item.instance}`},${MIPLIB_SOLUTION_URL},${`=opt= ${item.instance}`},${tx.json({instance:item.instance,objective:item.objective,status:"opt",solutionCatalogVersion:36,benchmarkSource:MIPLIB_BENCHMARK_URL})}),(${"DATASET"},${`MIPLIB feasible solution record — ${item.instance}`},${instanceUrl},${"Best Known Solution(s)"},${tx.json({instance:item.instance,objective:item.objective,validation:"MIPLIB solution checker",solutionCatalogVersion:36})}) returning id,type`;
      const lowerEvidence = evidenceRows.find((row) => row.type === "EXHAUSTIVE_COMPUTATION")!, upperEvidence = evidenceRows.find((row) => row.type === "DATASET")!;
      await tx`insert into claim_evidence (claim_id,evidence_id) values (${lower.id},${lowerEvidence.id}),(${upper.id},${upperEvidence.id})`;
      await tx`insert into claim_papers (claim_id,paper_id) values (${lower.id},${paper.id}),(${upper.id},${paper.id})`;
      await tx`insert into timeline_events (limit_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${"REGISTRY_PUBLICATION"},${"Published from official MIPLIB v36 catalog"},${`Matching proven lower and feasible upper bounds establish objective ${item.objective}.`},${MIPLIB_RELEASE_DATE},${tx.json({batch:"MIPLIB_2017_V36",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:MIPLIB_SOLUTION_URL})})`;
      await tx`insert into audit_logs (action,entity_type,entity_id,before,after,reason) values (${"FOUNDING_CATALOG_CLAIM_ACCEPTED"},${"CLAIM"},${lower.id},${tx.json({status:"SOURCE_IMPORT"})},${tx.json({status:"ACCEPTED",relation:">=",value:item.objective})},${"Official MIPLIB v36 =opt= benchmark import"}),(${"FOUNDING_CATALOG_CLAIM_ACCEPTED"},${"CLAIM"},${upper.id},${tx.json({status:"SOURCE_IMPORT"})},${tx.json({status:"ACCEPTED",relation:"<=",value:item.objective})},${"Official MIPLIB v36 =opt= benchmark import"}),(${"FOUNDING_CATALOG_LIMIT_PUBLISHED"},${"LIMIT"},${limit.id},${tx.json({status:"SOURCE_IMPORT"})},${tx.json({status:"PROVEN",publishedAt:MIPLIB_RELEASE_DATE.toISOString()})},${"Matching official lower and upper objective bounds"})`;
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, updated, miplibRecords: records.length, publicCount, sourceVersion: 36 }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
