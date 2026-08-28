/** Publishes three new real, verified bounties tied to genuine open technical/scientific
 *  frontiers, on top of the existing Millennium Problems + Beal Prize batch. Each was verified
 *  against its sponsor's own official page (not a news article) as currently active and
 *  unclaimed as of 2026-08-28. Mirrors scripts/seed-millennium-problems.ts's structure exactly:
 *  Limit + spec + evidence + bounty, no claim (there is no accepted quantitative result to cite
 *  honestly — these are open competitions, not proven bounds). */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

type Bounty = {
  id: string; title: string; category: string; subcategory: string; metricName: string;
  formalStatement: string; summary: string; sourceUrl: string;
  bountyTitle: string; sponsor: string; description: string; amount: string; expiresAt: string | null;
};

const BOUNTIES: Bounty[] = [
  {
    id: "LR-XPRIZE-HEALTHSPAN",
    title: "Reversal of age-related functional decline",
    category: "Biology",
    subcategory: "Aging",
    metricName: "Years of functional decline reversed (muscle, cognitive, immune)",
    formalStatement: "Using a treatment protocol of one year or less, restore muscle, cognitive, and immune function in adults aged 50-80 by a minimum of 10 years, with a stated goal of 20 years, relative to each participant's pre-treatment baseline.",
    summary: "XPRIZE Healthspan is a $101M competition (launched 2023, running through 2030) challenging teams to develop a real therapeutic — not just a way to slow aging, but to measurably reverse already-occurred functional decline. As of August 2026, 20 finalist teams are in clinical trials; 10 received $1M Milestone 2 awards, but no grand prize has been claimed.",
    sourceUrl: "https://www.xprize.org/competitions/healthspan",
    bountyTitle: "XPRIZE Healthspan",
    sponsor: "XPRIZE Foundation",
    description: "A $101M prize purse (up to $81M grand prize, plus a separate $10M FSHD Bonus Prize), backed by the Hevolution Foundation and Chip Wilson, for the first team to demonstrate real reversal of age-related functional decline in a one-year-or-shorter treatment. Runs through 2030; unclaimed as of August 2026.",
    amount: "81000000.00",
    expiresAt: null,
  },
  {
    id: "LR-XPRIZE-QUANTUM",
    title: "Demonstrated real-world quantum computational advantage",
    category: "Quantum Information",
    subcategory: "Quantum Advantage",
    metricName: "Credible real-world quantum computational advantage demonstrated",
    formalStatement: "Design and analyze a quantum algorithm with a credible, judged path to genuine quantum computational advantage on a real-world problem (e.g. drug discovery, climate modeling, fusion energy, or materials science), as evaluated against classical approaches by an independent judging panel.",
    summary: "XPRIZE Quantum Applications is a $5M competition, title-sponsored by Google Quantum AI and presented by GESDA, launched in 2024 to push quantum computing past toy benchmarks toward genuine, judged real-world advantage. Seven finalist teams were selected in December 2025 and are in Phase II as of August 2026; winners are due Spring 2027, with no prize yet claimed.",
    sourceUrl: "https://www.xprize.org/competitions/qc-apps",
    bountyTitle: "XPRIZE Quantum Applications",
    sponsor: "XPRIZE Foundation / Google Quantum AI",
    description: "A $5,000,000 prize for the team that best demonstrates a credible path to real-world quantum computational advantage, judged by an independent panel. Winners scheduled to be announced Spring 2027; unclaimed as of August 2026.",
    amount: "5000000.00",
    expiresAt: null,
  },
  {
    id: "LR-VESUVIUS",
    title: "Full virtual unrolling of a carbonized Herculaneum scroll",
    category: "Computing",
    subcategory: "Computer Vision",
    metricName: "Percentage of scroll text recovered and readable",
    formalStatement: "Using non-invasive CT scanning and machine learning, recover and render as readable text the substantial majority of a complete carbonized Herculaneum papyrus scroll — physically unopenable since being carbonized by the eruption of Mount Vesuvius in 79 AD.",
    summary: "The Vesuvius Challenge, a privately funded prize founded by Nat Friedman and Daniel Gross, offers a $1,000,000 Grand Prize (part of a $2.14M total open prize pool) for the first team to virtually unroll and read an entire carbonized Herculaneum scroll using CT scans and ML, without physically opening it. The deadline is June 25, 2027; the Grand Prize remains unclaimed as of August 2026, though smaller Progress and First Letters prizes have been awarded along the way.",
    sourceUrl: "https://scrollprize.org/prizes",
    bountyTitle: "Vesuvius Challenge — 2027 Grand Prize",
    sponsor: "Scroll Prize, Inc.",
    description: "A $1,000,000 Grand Prize (1st: $800K, 2nd: $100K, 3rd/4th: $50K each) for fully virtually unrolling and reading a complete carbonized Herculaneum scroll, part of a $2.14M total open prize pool. Deadline June 25, 2027; unclaimed as of August 2026.",
    amount: "1000000.00",
    expiresAt: "2027-06-25",
  },
];

async function main() { try {
  let published = 0, updated = 0, bountiesPublished = 0, bountiesSkipped = 0;
  for (const b of BOUNTIES) {
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
    await sql`insert into research_bounties (limit_id,title,sponsor,description,source_url,status,amount,currency,expires_at,moderation_note,verified_at) values (${limitId},${b.bountyTitle},${b.sponsor},${b.description},${b.sourceUrl},${"VERIFIED"},${b.amount},${"USD"},${b.expiresAt},${`Verified against the sponsor's own official competition page (${b.sourceUrl}) as active and unclaimed on 2026-08-28.`},${sql`now()`})`;
    bountiesPublished++;
  }
  const [{ verifiedBountyCount }] = await sql`select count(*)::int as "verifiedBountyCount" from research_bounties where status='VERIFIED'`;
  console.log(JSON.stringify({ published, updated, bountiesPublished, bountiesSkipped, verifiedBountyCount }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
