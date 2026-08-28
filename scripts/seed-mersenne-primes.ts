/** Publishes the first 30 known Mersenne primes (2^p - 1), sourced from OEIS A000043. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const SOURCE_URL = "https://oeis.org/A000043";
const PAPER_TITLE = "OEIS A000043: Mersenne prime exponents";

// p such that 2^p - 1 is prime, in exponent order (matching the well-known rank order), with the
// year each was verified prime. "Ancient" entries (2,3,5,7) use a nominal antiquity marker date.
const RECORDS: Array<{ rank: number; p: number; year: number; discoverer: string }> = [
  { rank: 1, p: 2, year: 100, discoverer: "Known since antiquity; earliest surviving written source is Nicomachus of Gerasa's Introduction to Arithmetic" },
  { rank: 2, p: 3, year: 100, discoverer: "Known since antiquity; earliest surviving written source is Nicomachus of Gerasa's Introduction to Arithmetic" },
  { rank: 3, p: 5, year: 100, discoverer: "Known since antiquity; earliest surviving written source is Nicomachus of Gerasa's Introduction to Arithmetic" },
  { rank: 4, p: 7, year: 100, discoverer: "Known since antiquity; earliest surviving written source is Nicomachus of Gerasa's Introduction to Arithmetic" },
  { rank: 5, p: 13, year: 1456, discoverer: "Anonymous medieval manuscript (Codex Latinus Monacensis 14908)" },
  { rank: 6, p: 17, year: 1588, discoverer: "Pietro Cataldi" },
  { rank: 7, p: 19, year: 1588, discoverer: "Pietro Cataldi" },
  { rank: 8, p: 31, year: 1772, discoverer: "Leonhard Euler" },
  { rank: 9, p: 61, year: 1883, discoverer: "Ivan Pervushin" },
  { rank: 10, p: 89, year: 1911, discoverer: "Ralph Ernest Powers" },
  { rank: 11, p: 107, year: 1914, discoverer: "Ralph Ernest Powers" },
  { rank: 12, p: 127, year: 1876, discoverer: "Édouard Lucas" },
  { rank: 13, p: 521, year: 1952, discoverer: "Raphael M. Robinson" },
  { rank: 14, p: 607, year: 1952, discoverer: "Raphael M. Robinson" },
  { rank: 15, p: 1279, year: 1952, discoverer: "Raphael M. Robinson" },
  { rank: 16, p: 2203, year: 1952, discoverer: "Raphael M. Robinson" },
  { rank: 17, p: 2281, year: 1952, discoverer: "Raphael M. Robinson" },
  { rank: 18, p: 3217, year: 1957, discoverer: "Hans Riesel" },
  { rank: 19, p: 4253, year: 1961, discoverer: "Alexander Hurwitz" },
  { rank: 20, p: 4423, year: 1961, discoverer: "Alexander Hurwitz" },
  { rank: 21, p: 9689, year: 1963, discoverer: "Donald B. Gillies" },
  { rank: 22, p: 9941, year: 1963, discoverer: "Donald B. Gillies" },
  { rank: 23, p: 11213, year: 1963, discoverer: "Donald B. Gillies" },
  { rank: 24, p: 19937, year: 1971, discoverer: "Bryant Tuckerman" },
  { rank: 25, p: 21701, year: 1978, discoverer: "Landon Curt Noll and Laura Nickel" },
  { rank: 26, p: 23209, year: 1979, discoverer: "Landon Curt Noll" },
  { rank: 27, p: 44497, year: 1979, discoverer: "Harry L. Nelson and David Slowinski" },
  { rank: 28, p: 86243, year: 1982, discoverer: "David Slowinski" },
  { rank: 29, p: 110503, year: 1988, discoverer: "Walter Colquitt and Luke Welsh" },
  { rank: 30, p: 132049, year: 1983, discoverer: "David Slowinski et al." },
];

let inserted = 0, skipped = 0;
async function main() { try {
  let [paper] = await sql`select id from papers where title=${PAPER_TITLE} limit 1`;
  if (!paper) [paper] = await sql`insert into papers (title,abstract,venue,publisher_url) values (${PAPER_TITLE},${"The authoritative sequence of exponents p for which the Mersenne number 2^p - 1 is prime."},${"The On-Line Encyclopedia of Integer Sequences"},${SOURCE_URL}) returning id`;
  for (const item of RECORDS) {
    const registryNumber = `LR-MERSENNE-${item.p}`, slug = `mersenne-prime-2-${item.p}-minus-1`;
    if ((await sql`select id from limits where registry_number=${registryNumber} limit 1`).length) { skipped++; continue; }
    const occurredAt = new Date(Date.UTC(item.year, 0, 1));
    await sql.begin(async (tx) => {
      const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,status,published_at) values (${registryNumber},${slug},${`Mersenne prime 2^${item.p} − 1`},${`The ${item.rank}${item.rank === 1 ? "st" : item.rank === 2 ? "nd" : item.rank === 3 ? "rd" : "th"} known Mersenne prime — the number 2^${item.p} − 1, verified prime.`},${"Number Theory"},${"Mersenne primes"},${"MAXIMIZE"},${"2^p − 1"},${"PROVEN"},${occurredAt}) returning id`;
      const [spec] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Is 2^${item.p} − 1 prime?`},${tx.json({exponent:item.p,form:"2^p - 1"})},${tx.json({publicationProcess:"FOUNDING_CATALOG_IMPORT"})}) returning id`;
      const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-MERSENNE-${item.p}`},${spec.id},${"EXACT_VALUE"},${"="},${`2^${item.p} − 1`},${`2^${item.p} − 1`},${tx.json({exponent:item.p,rank:item.rank})},${"PROVEN"},${"ACCEPTED"},${`Verified prime by ${item.discoverer}, ${item.year < 0 ? "antiquity" : item.year}.`}) returning id`;
      const [evidence] = await tx`insert into evidence (type,label,url,location,metadata) values (${"PAPER"},${`Mersenne prime exponent ${item.p} — rank ${item.rank}`},${SOURCE_URL},${`A000043, term ${item.rank}`},${tx.json({exponent:item.p,rank:item.rank,discoverer:item.discoverer,year:item.year})}) returning id`;
      await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
      await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
      await tx`insert into timeline_events (limit_id,claim_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${claim.id},${"SOURCE_RECOMMENDATION"},${`Verified prime by ${item.discoverer}`},${`2^${item.p} − 1 confirmed prime, the ${item.rank}${item.rank === 1 ? "st" : item.rank === 2 ? "nd" : item.rank === 3 ? "rd" : "th"} known Mersenne prime.`},${occurredAt},${tx.json({batch:"MERSENNE_PRIMES",publicationProcess:"FOUNDING_CATALOG_IMPORT",source:SOURCE_URL})})`;
    }); inserted++;
  }
  const [{ publicCount }] = await sql`select count(*)::int as "publicCount" from limits where status in ('OPEN','PROVEN')`;
  console.log(JSON.stringify({ inserted, skipped, publicCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
