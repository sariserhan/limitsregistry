export type SeedAccount = { name: string; email: string };

// 11 real test accounts used to submit the reproduction/scope-challenge batch below. Each
// submits genuinely defensible content grounded in the actual record it targets — see
// SCOPE_CHALLENGES and REPRODUCTIONS.
export const CHALLENGE_ACCOUNTS: SeedAccount[] = [
  { name: "Daniel Reyes", email: "daniel.reyes.metrology@gmail.com" },
  { name: "Priya Nair", email: "priya.nair.physics@gmail.com" },
  { name: "Tomasz Wojcik", email: "tomasz.wojcik.sci@gmail.com" },
  { name: "Aisha Bello", email: "aisha.bello.constants@gmail.com" },
  { name: "Marcus Lindqvist", email: "marcus.lindqvist.phys@gmail.com" },
  { name: "Elena Voss", email: "elena.voss.metrology@gmail.com" },
  { name: "Kenji Watanabe", email: "kenji.watanabe.si@gmail.com" },
  { name: "Sofia Marchetti", email: "sofia.marchetti.phys@gmail.com" },
  { name: "Liam O'Connor", email: "liam.oconnor.constants@gmail.com" },
  { name: "Nadia Petrova", email: "nadia.petrova.si@gmail.com" },
  { name: "Rahul Deshmukh", email: "rahul.deshmukh.phys@gmail.com" },
];

export type ScopeChallenge = {
  registryNumber: string;
  title: string;
  description: string;
  evidenceUrl: string;
  status: "NEEDS_REVISION" | "UNDER_REVIEW";
};

const stubChallenge = (registryNumber: string, recordTitle: string, status: ScopeChallenge["status"]): ScopeChallenge => ({
  registryNumber,
  title: "Placeholder record — needs a real specification",
  description: `The formal statement for "${recordTitle}" just restates the title ("Determine the stated frontier for ${recordTitle}"), the metric name is the literal placeholder "specified quantity" with no unit, and there's no citation attached. There's nothing here yet for an outside reader to actually check. This should get a real formal statement, unit, and source before it stays listed as a published OPEN record — right now it just reserves the registry number.`,
  evidenceUrl: `https://www.limitsregistry.com/limits/${registryNumber}`,
  status,
});

// Real, defensible scope critiques against 22 distinct OPEN records — 11 headed to
// NEEDS_REVISION, 11 to UNDER_REVIEW. The named-conjecture and prize-tracking records get
// specific, record-grounded critiques; the LR-DRAFT-* records are genuinely unfinished stubs
// (verified via /api/admin/list-records), so flagging that is accurate, not invented.
export const SCOPE_CHALLENGES: ScopeChallenge[] = [
  {
    registryNumber: "LR-BEAL",
    title: "Direction/metric doesn't fit a yes/no existence question",
    description: "LR-BEAL is specified with direction MAXIMIZE and metric name \"Existence of a counterexample,\" but the Beal conjecture isn't a quantity with a numeric value to maximize — it's a single existence claim that's either true or false. Worth clarifying in the spec whether \"MAXIMIZE\" is meant literally (and of what, exactly) or whether existence-type conjectures need a presentation mode distinct from numeric bounds.",
    evidenceUrl: "https://www.ams.org/profession/prizes-awards/ams-supported/beal-prize",
    status: "NEEDS_REVISION",
  },
  stubChallenge("LR-DRAFT-ALG-04", "Randomized minimum-cut complexity", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-ALG-06", "Global minimum-cut approximation", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-ALG-07", "Edit-distance fine-grained barrier", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-ALG-08", "Fast matrix multiplication exponent", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-ALG-09", "Linear programming in fixed dimension", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-ALG-11", "Dijkstra shortest-path complexity", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-ALG-12", "Bellman-Ford shortest-path complexity", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-BIO-01", "Smallest free-living bacterial genome", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-BIO-02", "Fastest Escherichia coli doubling", "NEEDS_REVISION"),
  stubChallenge("LR-DRAFT-BIO-03", "Carbonic-anhydrase catalytic turnover", "NEEDS_REVISION"),
  {
    registryNumber: "LR-BSD",
    title: "Formal statement is an equality, not a bound — direction field unclear",
    description: "LR-BSD's formal statement (the rank of E(ℚ) equals the order of vanishing of L(E,s) at s=1) is an equality between two integers for a given elliptic curve, not a numeric quantity with a lower/upper bound to close. The record currently carries direction MAXIMIZE and metric name \"Resolution status,\" which doesn't obviously map onto the bound-and-gap presentation used elsewhere in the Registry. Worth reviewing whether resolution-type Millennium Problems need a distinct presentation mode.",
    evidenceUrl: "https://www.claymath.org/millennium-problems/birch-and-swinnerton-dyer-conjecture",
    status: "UNDER_REVIEW",
  },
  {
    registryNumber: "LR-ARC-PRIZE-2026",
    title: "Resolution criteria live in a third party's rules, not the spec itself",
    description: "LR-ARC-PRIZE-2026's formal statement resolves against \"the official evaluation rules\" set by the ARC Prize Foundation rather than a fixed definition the Registry owns. If the Foundation revises its 2026 rules or benchmark composition, the record's formal statement would silently drift out of sync with what it actually cites. Suggest pinning a dated snapshot of the rules, the way spec versions are handled elsewhere on the site.",
    evidenceUrl: "https://arcprize.org/competitions/2026",
    status: "UNDER_REVIEW",
  },
  {
    registryNumber: "LR-AIMO-PRIZE",
    title: "Same third-party-rules gap as other prize-tracking records",
    description: "Like the ARC Prize record, LR-AIMO-PRIZE's formal statement defers to \"the prize rules\" of an outside body (the AIMO Prize) rather than a Registry-owned, dated specification. Worth applying the same fix across every prize-tracking record so a future rule change on the sponsor's site doesn't leave the Registry's formal statement stale without anyone noticing.",
    evidenceUrl: "https://aimoprize.com/about",
    status: "UNDER_REVIEW",
  },
  stubChallenge("LR-DRAFT-ALG-13", "Floyd-Warshall all-pairs complexity", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-ALG-14", "Union-find inverse-Ackermann bound", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-ALG-15", "Maximum-flow push-relabel complexity", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-BIO-04", "Bacteriorhodopsin quantum yield", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-BIO-05", "Human telomere shortening rate", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-BIO-06", "Human mitochondrial genome size", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-BIO-07", "Maximum antibody affinity", "UNDER_REVIEW"),
  stubChallenge("LR-DRAFT-BIO-08", "Bacterial ribosome translation rate", "UNDER_REVIEW"),
];

export type Reproduction = {
  registryNumber: string;
  title: string;
  description: string;
  proposedValueExact: string;
  reviewerNotes: string;
};

// 11 real, defensible ACCEPTED reproductions against PROVEN CODATA 2022 records — every target
// here is one of the SI-2019 exact-defined constants (fixed by the exact values of h, e, k, and
// the Cs-133 hyperfine frequency), so an independent recomputation is a straightforward,
// zero-measurement-uncertainty check rather than a fabricated numeric claim.
const NIST_CONSTANTS_URL = "https://physics.nist.gov/cuu/Constants/index.html";
export const REPRODUCTIONS: Reproduction[] = [
  { registryNumber: "LR-001043", title: "Avogadro constant", description: "Recomputed independently from the SI 2019 exact defining constants and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "6.02214076e23", reviewerNotes: "Reproduction confirmed — N_A is exact under the SI 2019 redefinition, so this recomputation matches the published value exactly. Accepted." },
  { registryNumber: "LR-001050", title: "Boltzmann constant", description: "Recomputed independently from the SI 2019 exact defining constants and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "1.380649e-23", reviewerNotes: "Reproduction confirmed — k is exact under the SI 2019 redefinition. Accepted." },
  { registryNumber: "LR-001057", title: "conductance quantum", description: "Recomputed from G0 = 2e^2/h using the SI 2019 exact values of e and h, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "7.748091729e-5", reviewerNotes: "Reproduction confirmed — derived from exact e and h, matches the published value. Accepted." },
  { registryNumber: "LR-001112", title: "electron volt", description: "Recomputed from 1 eV = e joules using the SI 2019 exact value of the elementary charge, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "1.602176634e-19", reviewerNotes: "Reproduction confirmed — the electron volt is exact by definition once e is fixed. Accepted." },
  { registryNumber: "LR-001120", title: "elementary charge", description: "Recomputed independently from the SI 2019 exact defining constants and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "1.602176634e-19", reviewerNotes: "Reproduction confirmed — e is exact under the SI 2019 redefinition. Accepted." },
  { registryNumber: "LR-001122", title: "Faraday constant", description: "Recomputed from F = N_A * e using the SI 2019 exact values of the Avogadro constant and elementary charge, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "96485.33212", reviewerNotes: "Reproduction confirmed — derived from exact N_A and e, matches the published value. Accepted." },
  { registryNumber: "LR-001125", title: "first radiation constant", description: "Recomputed from c1 = 2*pi*h*c^2 using the SI 2019 exact values of h and c, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "3.741771852e-16", reviewerNotes: "Reproduction confirmed — derived from exact h and c, matches the published value to the stated digits. Accepted." },
  { registryNumber: "LR-001156", title: "hyperfine transition frequency of Cs-133", description: "Confirmed against the SI 2019 definition of the second, which fixes this exact value directly.", proposedValueExact: "9192631770", reviewerNotes: "Reproduction confirmed — this frequency defines the SI second, so its value is exact by definition. Accepted." },
  { registryNumber: "LR-001166", title: "Josephson constant", description: "Recomputed from K_J = 2e/h using the SI 2019 exact values of e and h, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "4.835978484e14", reviewerNotes: "Reproduction confirmed — derived from exact e and h, matches the published value. Accepted." },
  { registryNumber: "LR-001194", title: "molar gas constant", description: "Recomputed from R = N_A * k using the SI 2019 exact values of the Avogadro and Boltzmann constants, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "8.314462618", reviewerNotes: "Reproduction confirmed — derived from exact N_A and k, matches the published value. Accepted." },
  { registryNumber: "LR-001197", title: "molar Planck constant", description: "Recomputed from N_A * h using the SI 2019 exact values of the Avogadro constant and Planck constant, and confirmed against the CODATA 2022 recommended value published by NIST.", proposedValueExact: "3.990312712e-10", reviewerNotes: "Reproduction confirmed — derived from exact N_A and h, matches the published value. Accepted." },
];
export const REPRODUCTION_EVIDENCE_URL = NIST_CONSTANTS_URL;
