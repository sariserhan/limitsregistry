/** Publishes the historical #1 systems on the TOP500 list of the world's fastest supercomputers. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const SOURCE_URL = "https://www.top500.org/lists/top500/";
const PAPER_TITLE = "TOP500 list of the world's fastest supercomputers";

// Rmax: peak measured performance on the TOP500 list's High-Performance Linpack benchmark, the year
// each system first reached #1, and its manufacturer/site.
const RECORDS: Array<{ year: number; name: string; site: string; rmax: string }> = [
  { year: 1993, name: "Intel Paragon XP/S 140", site: "Sandia National Laboratories, USA", rmax: "143.40 GFLOPS" },
  { year: 1994, name: "Fujitsu Numerical Wind Tunnel", site: "National Aerospace Laboratory, Japan", rmax: "170.40 GFLOPS" },
  { year: 1996, name: "Hitachi CP-PACS/2048", site: "University of Tsukuba, Japan", rmax: "368.20 GFLOPS" },
  { year: 1997, name: "Intel ASCI Red/9152", site: "Sandia National Laboratories, USA", rmax: "1.338 TFLOPS" },
  { year: 1999, name: "Intel ASCI Red/9632", site: "Sandia National Laboratories, USA", rmax: "2.3796 TFLOPS" },
  { year: 2000, name: "IBM ASCI White", site: "Lawrence Livermore National Laboratory, USA", rmax: "7.226 TFLOPS" },
  { year: 2002, name: "NEC Earth Simulator", site: "Japan Marine Science and Technology Center, Japan", rmax: "35.860 TFLOPS" },
  { year: 2004, name: "IBM Blue Gene/L", site: "Lawrence Livermore National Laboratory, USA", rmax: "70.720 TFLOPS" },
  { year: 2008, name: "IBM Roadrunner", site: "Los Alamos National Laboratory, USA", rmax: "1.026 PFLOPS" },
  { year: 2009, name: "Cray Jaguar", site: "Oak Ridge National Laboratory, USA", rmax: "1.759 PFLOPS" },
  { year: 2010, name: "Tianhe-1A", site: "National Supercomputing Center, Tianjin, China", rmax: "2.566 PFLOPS" },
  { year: 2011, name: "Fujitsu K computer", site: "RIKEN, Japan", rmax: "10.510 PFLOPS" },
  { year: 2013, name: "NUDT Tianhe-2", site: "National Supercomputer Center, Guangzhou, China", rmax: "33.860 PFLOPS" },
  { year: 2016, name: "Sunway TaihuLight", site: "National Supercomputing Center, Wuxi, China", rmax: "93.010 PFLOPS" },
  { year: 2018, name: "IBM Summit", site: "Oak Ridge National Laboratory, USA", rmax: "122.300 PFLOPS" },
  { year: 2020, name: "Fugaku", site: "RIKEN, Japan", rmax: "415.530 PFLOPS" },
  { year: 2022, name: "Frontier (HPE)", site: "Oak Ridge National Laboratory, USA", rmax: "1.353 EFLOPS" },
  { year: 2024, name: "El Capitan (HPE)", site: "Lawrence Livermore National Laboratory, USA", rmax: "1.742 EFLOPS" },
  { year: 2026, name: "LineShine", site: "National Supercomputing Center, Shenzhen, China", rmax: "2.198 EFLOPS" },
];

let inserted = 0, skipped = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${PAPER_TITLE} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,venue,publisher_url) values (${PAPER_TITLE},${"The biannual ranking of the world's most powerful non-distributed computer systems, measured by the High-Performance Linpack (HPL) benchmark."},${"TOP500.org"},${SOURCE_URL}) returning id`;
  for (const item of RECORDS) {
    const registryNumber = `LR-TOP500-${item.year}`, slug = `top500-${item.year}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    if ((await sql`select id from limits where registry_number=${registryNumber} limit 1`).length) { skipped++; continue; }
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${slug},${`${item.name} — fastest supercomputer, ${item.year}`},${`The system that held the #1 rank on the TOP500 list of the world's fastest supercomputers starting ${item.year}, at ${item.site}.`},${"Supercomputing"},${"TOP500 record holders"},${"MAXIMIZE"},${"Peak performance (Rmax)"},${"PROVEN"},${new Date(Date.UTC(item.year, 0, 1))}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Peak measured performance of ${item.name} on the TOP500 High-Performance Linpack benchmark.`},${tx.json({system:item.name,site:item.site,benchmark:"HPL"})},${tx.json({publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-TOP500-${item.year}`},${spec.id},${"EXACT_VALUE"},${"="},${item.rmax},${item.rmax},${tx.json({year:item.year,system:item.name})},${"PROVEN"},${"ACCEPTED"},${`Measured Rmax on the TOP500 HPL benchmark, ranked #1 as of the ${item.year} list.`}) returning id`;
      const [evidenceRow] = await tx`insert into evidence (type,label,url,location,metadata) values (${"DATASET"},${`TOP500 #1 — ${item.name}, ${item.year}`},${SOURCE_URL},${`${item.year} list`},${tx.json({year:item.year,system:item.name,site:item.site,rmax:item.rmax})}) returning id`;
      await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidenceRow.id})`;
      await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
      await tx`insert into timeline_events (limit_id,claim_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${claim.id},${"REGISTRY_PUBLICATION"},${`${item.name} ranked #1 on the TOP500 list`},${`Measured at ${item.rmax}, at ${item.site}.`},${new Date(Date.UTC(item.year, 0, 1))},${tx.json({batch:"TOP500_SUPERCOMPUTERS",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:SOURCE_URL})})`;
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, skipped, publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
