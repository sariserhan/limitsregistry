export type NewBounty = {
  id: string; title: string; category: string; subcategory: string; metricName: string;
  formalStatement: string; summary: string; sourceUrl: string;
  bountyTitle: string; sponsor: string; description: string; amount: string; expiresAt: string | null;
};

// Verified against each sponsor's own official page (not a news article) as currently active
// and unclaimed as of 2026-08-28. Shared by scripts/seed-new-bounties-2026.ts (local dev DB) and
// app/api/admin/seed-new-bounties-2026/route.ts (real production, run at request time) so the
// verified facts can't drift between the two copies.
export const NEW_BOUNTIES_2026: NewBounty[] = [
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
