/** Publishes the RSA Factoring Challenge numbers and their public factorization status. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const SOURCE_URL = "https://en.wikipedia.org/wiki/RSA_numbers";
const PAPER_TITLE = "RSA Factoring Challenge numbers";

// name is the challenge's public label; digits is the modulus's decimal digit count (RSA Labs named
// the smaller numbers by digit count, then switched to bit-length for later ones, e.g. RSA-2048).
const RECORDS: Array<{ name: string; digits: number; factored: { year: number; by: string } | null }> = [
  { name: "RSA-100", digits: 100, factored: { year: 1991, by: "Arjen K. Lenstra and Mark S. Manasse" } },
  { name: "RSA-110", digits: 110, factored: { year: 1992, by: "Arjen K. Lenstra and Mark S. Manasse" } },
  { name: "RSA-120", digits: 120, factored: { year: 1993, by: "Denny, Dodson, Lenstra, and Manasse" } },
  { name: "RSA-129", digits: 129, factored: { year: 1994, by: "Atkins, Graff, Lenstra, and Leyland" } },
  { name: "RSA-130", digits: 130, factored: { year: 1996, by: "Lenstra-led team of seven researchers" } },
  { name: "RSA-140", digits: 140, factored: { year: 1999, by: "te Riele-led team of nine researchers" } },
  { name: "RSA-150", digits: 150, factored: { year: 2004, by: "Aoki et al." } },
  { name: "RSA-155", digits: 155, factored: { year: 1999, by: "te Riele-led team of over fifteen researchers" } },
  { name: "RSA-160", digits: 160, factored: { year: 2003, by: "Franke, Bahr, Kleinjung, Lochter, and Böhm" } },
  { name: "RSA-170", digits: 170, factored: { year: 2009, by: "Bonenberger and Krone" } },
  { name: "RSA-576", digits: 174, factored: { year: 2003, by: "Franke and Kleinjung" } },
  { name: "RSA-180", digits: 180, factored: { year: 2010, by: "Danilov and Popovyan" } },
  { name: "RSA-190", digits: 190, factored: { year: 2010, by: "Popovyan and Timofeev" } },
  { name: "RSA-640", digits: 193, factored: { year: 2005, by: "Bahr, Boehm, Franke, and Kleinjung" } },
  { name: "RSA-200", digits: 200, factored: { year: 2005, by: "Bahr, Boehm, Franke, and Kleinjung" } },
  { name: "RSA-210", digits: 210, factored: { year: 2013, by: "Ryan Propper" } },
  { name: "RSA-704", digits: 212, factored: { year: 2012, by: "Bai, Thomé, and Zimmermann" } },
  { name: "RSA-220", digits: 220, factored: { year: 2016, by: "Bai, Gaudry, Kruppa, Thomé, and Zimmermann" } },
  { name: "RSA-230", digits: 230, factored: { year: 2018, by: "Samuel S. Gross" } },
  { name: "RSA-768", digits: 232, factored: { year: 2009, by: "Kleinjung-led team of twelve researchers" } },
  { name: "RSA-232", digits: 232, factored: { year: 2020, by: "Zamarashkin, Zheltkov, and Matveev" } },
  { name: "RSA-240", digits: 240, factored: { year: 2019, by: "Boudot, Gaudry, Guillevic, Heninger, Thomé, and Zimmermann" } },
  { name: "RSA-250", digits: 250, factored: { year: 2020, by: "Boudot, Gaudry, Guillevic, Heninger, Thomé, and Zimmermann" } },
  { name: "RSA-260", digits: 260, factored: null },
  { name: "RSA-270", digits: 270, factored: null },
  { name: "RSA-896", digits: 270, factored: null },
  { name: "RSA-280", digits: 280, factored: null },
  { name: "RSA-1024", digits: 309, factored: null },
  { name: "RSA-2048", digits: 617, factored: null },
];

const summaryFor = (item: (typeof RECORDS)[number]) => `RSA public-key encryption relies on a modulus that is the product of two large secret primes — factoring it back into those primes would break the key. ${item.name} is a ${item.digits}-decimal-digit challenge modulus published by RSA Laboratories to track how large a semiprime is practical to factor with current methods.`;

let inserted = 0, updated = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${PAPER_TITLE} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,venue,publisher_url) values (${PAPER_TITLE},${"The semiprime moduli published by RSA Laboratories in 1991 and 2001 to track the practical difficulty of integer factorization, with a running record of which have been publicly factored."},${"RSA Laboratories / community factoring efforts"},${SOURCE_URL}) returning id`;
  for (const item of RECORDS) {
    const registryNumber = `LR-${item.name}`, slug = item.name.toLowerCase();
    const existing = await sql`select id from limits where registry_number=${registryNumber} limit 1`;
    if (existing.length) { await sql`update limits set summary=${summaryFor(item)},updated_at=now() where id=${existing[0].id}`; updated++; continue; }
    const status = item.factored ? "PROVEN" : "OPEN";
    const publishedAt = item.factored ? new Date(Date.UTC(item.factored.year, 0, 1)) : null;
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${slug},${`${item.name} factoring challenge`},${summaryFor(item)},${"Cryptography"},${"RSA Factoring Challenge"},${"MAXIMIZE"},${"Factorization status"},${status},${publishedAt}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Is the ${item.name} modulus factored into its two prime factors?`},${tx.json({modulus:item.name,digits:item.digits})},${tx.json({publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [evidence] = await tx`insert into evidence (type,label,url,location,metadata) values (${"PAPER"},${`RSA Factoring Challenge — ${item.name}`},${SOURCE_URL},${item.name},${tx.json({modulus:item.name,digits:item.digits,factored:item.factored})}) returning id`;
      if (item.factored) {
        const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-${item.name}`},${spec.id},${"CONSTRUCTION"},${"="},${"Factored"},${`Factored by ${item.factored.by}, ${item.factored.year}.`},${tx.json({modulus:item.name})},${"PROVEN"},${"ACCEPTED"},${`Publicly factored into its two prime factors by ${item.factored.by} (${item.factored.year}), via the general number field sieve.`}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
        await tx`insert into timeline_events (limit_id,claim_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${claim.id},${"REGISTRY_PUBLICATION"},${`${item.name} publicly factored`},${`Factored by ${item.factored.by} in ${item.factored.year}.`},${publishedAt},${tx.json({batch:"RSA_FACTORING",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:SOURCE_URL})})`;
      }
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, updated, publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
