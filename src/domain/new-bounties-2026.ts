export type NewBounty = {
  id: string; title: string; category: string; subcategory: string; metricName: string;
  formalStatement: string; summary: string; sourceUrl: string;
  bountyTitle: string; sponsor: string; description: string; amount: string | null; currency: string | null; expiresAt: string | null;
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
    currency: "USD",
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
    currency: "USD",
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
    currency: "USD",
    expiresAt: "2027-06-25",
  },
  {"id":"LR-ARC-PRIZE-2026","title":"AI reasoning and fluid intelligence","category":"Artificial Intelligence","subcategory":"AI Reasoning","metricName":"Performance on ARC-AGI reasoning benchmarks","formalStatement":"Develop an open-source AI system that achieves qualifying performance on the ARC-AGI-2 or ARC-AGI-3 benchmark under the official evaluation rules.","summary":"ARC Prize 2026 is an open-source AI reasoning competition spanning ARC-AGI-2, ARC-AGI-3, and a paper prize, with a combined prize pool of $2 million.","sourceUrl":"https://arcprize.org/competitions/2026","bountyTitle":"ARC Prize 2026","sponsor":"ARC Prize Foundation","description":"A $2,000,000 prize program across three tracks for reproducible, open-source progress on ARC-AGI-2 and ARC-AGI-3. The official entry deadline is October 26, 2026 and final submissions are due November 2, 2026.","amount":"2000000.00","currency":"USD","expiresAt":"2026-11-02"},
  {"id":"LR-AIMO-PRIZE","title":"Gold-medal-level mathematical reasoning by an AI model","category":"Artificial Intelligence","subcategory":"Mathematical Reasoning","metricName":"Performance at an IMO-gold-medal standard","formalStatement":"Produce an AI model that enters an AIMO-approved competition and performs at a standard equivalent to an IMO gold medal under the prize rules.","summary":"The AIMO Prize is a $10 million program to accelerate open AI systems that can reason mathematically, including a $5 million grand prize and staged progress prizes.","sourceUrl":"https://aimoprize.com/about","bountyTitle":"AIMO Prize","sponsor":"AI Mathematical Olympiad Prize","description":"A $10,000,000 prize program for open mathematical-reasoning AI. The $5,000,000 grand prize is tied to gold-medal-level performance in an approved competition; progress prizes and a 2026 proof pilot provide intermediate targets.","amount":"10000000.00","currency":"USD","expiresAt":null},
  {"id":"LR-ITU-AI-SPACE","title":"AI and machine learning for space computing","category":"Computing","subcategory":"AI/ML and Space","metricName":"Challenge performance on space-computing problem tracks","formalStatement":"Develop and evaluate an AI or machine-learning solution to one of the official ITU AI and Space Computing Challenge problem tracks under the published rules.","summary":"The ITU AI/ML Challenge platform hosts global applied-AI competitions, including an AI and Space Computing Challenge with a CHF 39,000 prize pool.","sourceUrl":"https://aiforgood.itu.int/ai-ml-challenges/","bountyTitle":"ITU AI and Space Computing Challenge","sponsor":"International Telecommunication Union","description":"A CHF 39,000 prize pool across three AI and space-computing challenge tracks. The official challenge page publishes the problem tracks and participation information; the Registry does not administer payment.","amount":"39000.00","currency":"CHF","expiresAt":null},
  {"id":"LR-NIH-QUANTUM-COMPUTING","title":"Quantum algorithms for biomedical problems","category":"Computing","subcategory":"Quantum Computing","metricName":"Validated biomedical quantum-computing solution","formalStatement":"Adopt, optimize, or develop a quantum algorithm that addresses a biomedical problem and produces a transformative solution under the NIH challenge criteria.","summary":"The NIH Quantum Computing Challenge seeks quantum-computing solutions to translational biomedical problems and lists a final project delivery deadline of March 29, 2027.","sourceUrl":"https://www.nih.gov/challenges","bountyTitle":"NIH Quantum Computing Challenge","sponsor":"National Institutes of Health","description":"An NIH challenge for applying quantum algorithms to translational biomedical problems. The official listing gives a final project delivery date of March 29, 2027; prize amount is not stated on the summary page and remains to be confirmed from detailed rules.","amount":null,"currency":null,"expiresAt":"2027-03-29"},
  {"id":"LR-SOLAR-FILAMENT-2026","title":"Automated solar-filament segmentation","category":"Artificial Intelligence","subcategory":"Computer Vision","metricName":"Solar-filament segmentation score","formalStatement":"Develop a computer-vision system that automatically segments solar filaments from the official GONG H-alpha observations under the 2026 challenge rubric.","summary":"The Solar Filament Segmentation Challenge 2026 is a computer-vision competition with an advertised prize pool of up to $3,000.","sourceUrl":"https://www.kaggle.com/competitions/filament-segmentation-2026","bountyTitle":"Solar Filament Segmentation Challenge 2026","sponsor":"AURA / National Solar Observatory","description":"Up to $3,000 for winning computer-vision teams that segment solar filaments from GONG H-alpha observations. Winners are scheduled to be announced at IEEE BigData 2026 in December.","amount":"3000.00","currency":"USD","expiresAt":null},
  {"id":"LR-MICROSOFT-QUANTUM-PIONEERS-2026","title":"Software foundations for fault-tolerant quantum computing","category":"Computing","subcategory":"Quantum Software","metricName":"Quality of directed quantum-software research proposal","formalStatement":"Propose technically rigorous research advancing quantum error correction, algorithms, architecture, or quantum-software foundations under the 2026 Software Track rules.","summary":"Microsofts 2026 Quantum Pioneers Software Track solicited academic proposals in quantum error correction, algorithms, applications, and architecture. Its entry period ended July 17, 2026.","sourceUrl":"https://quantum.microsoft.com/en-us/insights/blogs/2026-quantum-pioneers-program-hardware-and-software-tracks","bountyTitle":"Microsoft Quantum Pioneers 2026 - Software Track","sponsor":"Microsoft Quantum","description":"An expired 2026 software-research contest for faculty proposals advancing fault-tolerant quantum computing. The entry period ran June 10 through July 17, 2026; winners were announced or became requestable after August 14, 2026, and the rules mention a winner list for prizes worth $25 or more, but do not state a total prize pool.","amount":null,"currency":null,"expiresAt":"2026-07-17"},
 ];
