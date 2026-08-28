import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const bounties = [
  ["LR-003308", "NIH Quantum Computing Challenge", "National Institutes of Health / NCATS", "An NIH prize challenge for applying quantum algorithms to translational biomedical problems, including drug discovery, clinical risk, biomedical imaging, and genomic data analysis. This is a related research incentive for quantum information-processing limits; the Limits Registry does not administer the challenge.", "https://www.nih.gov/challenges/nih-quantum-computing-challenge", "1300000.00", "2027-03-29", "Verified against the official NIH challenge page: total cash prizes up to $1,300,000 and Stage 2 final project delivery on March 29, 2027."],
  ["LR-003611", "TOPx HHS Tech Sprint for AI and Invisible Illness", "HHS / NIH", "A national HHS and NIH prize competition using U.S. open data and AI to build tools for invisible illness, including Lyme disease, Long COVID, autoimmune conditions, and related chronic illness. This is a related AI reliability and decision-support incentive; it is not a claim that the sprint proves the linked PAC-Bayes record.", "https://www.nih.gov/challenges/topx-hhs-tech-sprint-ai-invisible-illness", "2000000.00", "2026-10-15", "Verified against the official NIH challenge page: prize pool up to $2,000,000 and Phase 2 submission close on October 15, 2026."],
  ["LR-003636", "DARPA Triage Challenge -- 2026 Finals", "DARPA", "A DARPA challenge developing real-time systems and data-driven algorithms for medical triage when resources are limited. This is a related algorithmic decision-making incentive; the Registry does not administer the competition or certify its results.", "https://www.darpa.mil/research/challenges/darpa-triage-challenge/about", "1500000.00", "2026-11-13", "Verified against DARPA official Triage Challenge pages and 2026 program materials: the 2026 Systems final lists a $1.5M grand prize and the final is scheduled for November 5--13, 2026."]
];

async function main() {
  let inserted = 0, skipped = 0;
  const missingLimits: string[] = [];
  try {
    for (const [registryNumber, title, sponsor, description, sourceUrl, amount, expiresAt, moderationNote] of bounties) {
      const [limit] = await sql`select id from limits where registry_number = ${registryNumber} and status in ('OPEN', 'PROVEN', 'DISPUTED', 'RETIRED') limit 1`;
      if (!limit) { missingLimits.push(registryNumber); continue; }
      const existing = await sql`select id from research_bounties where limit_id = ${limit.id} and title = ${title} limit 1`;
      if (existing.length) { skipped++; continue; }
      await sql`insert into research_bounties (limit_id,title,sponsor,description,source_url,status,amount,currency,expires_at,moderation_note,verified_at) values (${limit.id},${title},${sponsor},${description},${sourceUrl},'VERIFIED',${amount},'USD',${expiresAt},${moderationNote},now())`;
      inserted++;
    }
    const [{ verifiedBountyCount }] = await sql`select count(*)::int as "verifiedBountyCount" from research_bounties where status = 'VERIFIED'`;
    console.log(JSON.stringify({ inserted, skipped, missingLimits, verifiedBountyCount }));
  } finally { await sql.end(); }
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });