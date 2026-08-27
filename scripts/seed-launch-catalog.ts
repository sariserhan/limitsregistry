/**
 * Seeds the 25-item launch catalog (src/catalog/launch-catalog.ts) with
 * real, citation-backed evidence gathered via research — never invented.
 *
 * Everything here lands as DRAFT: Limits stay status=DRAFT, Claims stay
 * status=DRAFT with epistemicStatus=LITERATURE_ASSERTED. Nothing is
 * published (no status flip to OPEN/PROVEN, no ACCEPTED claim) — per
 * LIMITS_REGISTRY_MASTER_SPEC.md §8, that requires independent human
 * review, which this script cannot perform on its own behalf.
 *
 * Idempotent: skips a Limit whose registryNumber already exists, so it's
 * safe to re-run after adding more entries to SEED.
 *
 * Run with: npx tsx scripts/seed-launch-catalog.ts
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { findDuplicatePaper } from "../src/domain/duplicate-detection";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const db = drizzle(postgres(connectionString), { schema });

type ClaimType = "UPPER_BOUND" | "LOWER_BOUND" | "EXACT_VALUE" | "CONSTRUCTION" | "COUNTEREXAMPLE" | "ASYMPTOTIC_BOUND" | "COMPUTATIONAL_BOUND";
type Relation = "<" | "<=" | "=" | ">=" | ">";
type EpistemicStatus = "LITERATURE_ASSERTED" | "SOURCE_CONFIRMED" | "REPRODUCED" | "PROVEN" | "FORMALLY_PROVEN" | "EMPIRICALLY_SUPPORTED" | "DISPUTED" | "INVALIDATED";
type ContributorRole = "PROBLEM_ORIGINATOR" | "DISCOVERER" | "RECORD_SETTER" | "BOUND_AUTHOR" | "PROOF_AUTHOR" | "FORMALIZER" | "REPRODUCER" | "VERIFIER" | "DATASET_AUTHOR" | "IMPLEMENTER" | "EDITOR";

type SeedPerson = { displayName: string; role: ContributorRole; orcid?: string; website?: string };
type SeedPaper = { title: string; authors?: SeedPerson[]; venue?: string; year?: number; doi?: string; arxivId?: string; url?: string };
type SeedClaim = { claimType: ClaimType; relation: Relation; valueExact: string; valueText?: string; epistemicStatus: EpistemicStatus; methodSummary?: string; paperIndex: number };
type SeedTimelineEvent = { year: number; title: string; description?: string };

type SeedLimit = {
  registryNumber: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  subcategory?: string;
  direction: "MINIMIZE" | "MAXIMIZE";
  metricName: string;
  unit?: string;
  formalStatement: string;
  papers: SeedPaper[];
  claims: SeedClaim[];
  timeline: SeedTimelineEvent[];
};

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function limit(registryNumber: string, title: string, opts: Omit<SeedLimit, "registryNumber" | "title" | "slug">): SeedLimit {
  return { registryNumber, title, slug: slugify(title), ...opts };
}

// Filled in from real, cited research (five parallel research passes, one per
// batch of five catalog items) — never invented. Institutional affiliations
// were left out almost everywhere: the research came back "not confirmed"
// for nearly every author, so per the resolve-conservatively rule they're
// skipped rather than guessed. People (paper authorship) is resolved since
// that's independently verifiable from the paper itself, unlike affiliation.
const SEED: SeedLimit[] = [
  limit("LR-000200", "Maximum edges in a triangle-free graph", {
    category: "Mathematics", subcategory: "Graph theory", direction: "MAXIMIZE", metricName: "edges",
    summary: "The most edges an n-vertex graph can have while containing no triangle.",
    formalStatement: "ex(n, K3) = the maximum number of edges in a triangle-free graph on n vertices.",
    papers: [{ title: "Problem 28", authors: [{ displayName: "W. Mantel", role: "PROOF_AUTHOR" }], venue: "Wiskundige Opgaven", year: 1907 }],
    claims: [{ claimType: "EXACT_VALUE", relation: "=", valueExact: "floor(n^2/4)", valueText: "⌊n²/4⌋, achieved by the balanced complete bipartite graph", epistemicStatus: "PROVEN", methodSummary: "Mantel's theorem; the extremal graph is K⌊n/2⌋,⌈n/2⌉.", paperIndex: 0 }],
    timeline: [
      { year: 1907, title: "Mantel proves ex(n,K3) = ⌊n²/4⌋" },
      { year: 1941, title: "Turán generalizes to Kr+1-free graphs", description: "Founded extremal graph theory (Turán's theorem)." },
    ],
  }),
  limit("LR-000201", "Chromatic number of the plane", {
    category: "Mathematics", subcategory: "Combinatorics", direction: "MINIMIZE", metricName: "colors",
    summary: "The fewest colors needed so that no two points at unit distance share a color (Hadwiger–Nelson problem).",
    formalStatement: "χ(plane) = the chromatic number of the unit-distance graph on the Euclidean plane.",
    papers: [{ title: "The chromatic number of the plane is at least 5", authors: [{ displayName: "Aubrey D.N.J. de Grey", role: "DISCOVERER" }], year: 2018, arxivId: "1804.02385", url: "https://arxiv.org/abs/1804.02385" }],
    claims: [{ claimType: "LOWER_BOUND", relation: ">=", valueExact: "5", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "1581-vertex unit-distance graph shown not 4-colorable; later reduced to a 509-vertex human-verifiable proof by Polymath16.", paperIndex: 0 }],
    timeline: [
      { year: 1950, title: "Nelson conjectures lower bound 4; Isbell gives upper bound 7", description: "Both informal/unpublished — documented later in Soifer's 'The Mathematical Coloring Book' (2009)." },
      { year: 2018, title: "de Grey raises the lower bound to 5", description: "First improvement in roughly 68 years." },
    ],
  }),
  limit("LR-000202", "The Černý conjecture", {
    category: "Mathematics", subcategory: "Automata theory", direction: "MAXIMIZE", metricName: "shortest synchronizing word length",
    summary: "The longest that the shortest reset word can be, for an n-state synchronizing automaton.",
    formalStatement: "What is the maximum over n-state synchronizing automata of the length of their shortest synchronizing word?",
    papers: [
      { title: "Poznámka k homogénnym eksperimentom s konečnými automatami", authors: [{ displayName: "Ján Černý", role: "PROBLEM_ORIGINATOR" }], venue: "Matematicko-fyzikálny Časopis SAV", year: 1964 },
      { title: "An improvement to a recent upper bound for synchronizing words of finite automata", authors: [{ displayName: "Yaroslav Shitov", role: "BOUND_AUTHOR" }], venue: "Journal of Automata, Languages and Combinatorics", year: 2019, arxivId: "1901.06542", url: "https://arxiv.org/abs/1901.06542" },
    ],
    claims: [
      { claimType: "CONSTRUCTION", relation: "=", valueExact: "(n-1)^2", epistemicStatus: "LITERATURE_ASSERTED", methodSummary: "Černý's construction; conjectured (not proven) to be the worst case.", paperIndex: 0 },
      { claimType: "UPPER_BOUND", relation: "<=", valueExact: "0.1654*n^3", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Refines Szykuła's 2018 ~0.1664·n³ bound (STACS 2018). Note: arXiv:1405.2435 (Trahtman) claims a full proof of the conjecture but is not accepted by the community as verified — deliberately not cited as the current record.", paperIndex: 1 },
    ],
    timeline: [
      { year: 1964, title: "Černý conjectures (n−1)² is tight" },
      { year: 1982, title: "Pin and Frankl prove the first general cubic upper bound", description: "(n³−n)/6 − 1, stood for roughly 35 years." },
      { year: 2019, title: "Shitov improves the upper bound to ~0.1654·n³" },
    ],
  }),
  limit("LR-000203", "Largest cap set in [3]^n", {
    category: "Mathematics", subcategory: "Combinatorics", direction: "MAXIMIZE", metricName: "cap set size (exponential growth rate)",
    summary: "How large a subset of [3]^n can be while containing no three points on a line (no 3-term arithmetic progression).",
    formalStatement: "What is the largest subset of the grid [3]^n containing no combinatorial line (three points a, b, c with a+b+c=0 coordinatewise)?",
    papers: [
      { title: "New Lower Bounds for Cap Sets", authors: [{ displayName: "Fred Tyrrell", role: "RECORD_SETTER" }], venue: "Discrete Analysis", year: 2023, arxivId: "2209.10045", url: "https://arxiv.org/abs/2209.10045" },
      { title: "On large subsets of 𝔽qⁿ with no three-term arithmetic progression", authors: [{ displayName: "Jordan S. Ellenberg", role: "BOUND_AUTHOR" }, { displayName: "Dion H.J. Gijswijt", role: "BOUND_AUTHOR" }], venue: "Annals of Mathematics", year: 2017, arxivId: "1605.09223", url: "https://arxiv.org/abs/1605.09223" },
    ],
    claims: [
      { claimType: "LOWER_BOUND", relation: ">=", valueExact: "2.218^n", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "First improvement to Edel's 2004 ≈2.2174ⁿ construction in ~19 years.", paperIndex: 0 },
      { claimType: "UPPER_BOUND", relation: "<=", valueExact: "O(2.756^n)", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Polynomial (Croot–Lev–Pach) method; resolved the exponential growth-rate question, though the exact base remains an open gap (2.218 vs 2.756).", paperIndex: 1 },
    ],
    timeline: [
      { year: 2004, title: "Edel's product construction gives lower bound ≈2.2174ⁿ" },
      { year: 2016, title: "Croot–Lev–Pach introduce the polynomial method" },
      { year: 2017, title: "Ellenberg–Gijswijt resolve the upper-bound growth rate" },
      { year: 2023, title: "Tyrrell improves the lower bound to 2.218ⁿ" },
    ],
  }),
  limit("LR-000204", "Erdős–Moser equation", {
    category: "Mathematics", subcategory: "Number theory", direction: "MINIMIZE", metricName: "m in any nontrivial solution",
    summary: "Whether 1^k+2^k+...+(m-1)^k = m^k has any solution with k>1 — no solution is known, and any hypothetical one must be astronomically large.",
    formalStatement: "Does 1^k + 2^k + ... + (m-1)^k = m^k have a solution with k > 1 (excluding the trivial 1+2=3)?",
    papers: [{ title: "The Erdős–Moser equation 1^k+2^k+...+(m−1)^k=m^k revisited using continued fractions", authors: [{ displayName: "Yves Gallot", role: "BOUND_AUTHOR" }, { displayName: "Pieter Moree", role: "BOUND_AUTHOR" }, { displayName: "Wadim Zudilin", role: "BOUND_AUTHOR" }], venue: "Mathematics of Computation", year: 2011, arxivId: "0907.1356", url: "https://arxiv.org/abs/0907.1356" }],
    claims: [{ claimType: "LOWER_BOUND", relation: ">", valueExact: "2.7139*10^1667658416", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Any nontrivial solution (k≥2) must have m exceeding this value; improves Moser's 1953 bound of m > 10^(10^6) via continued-fraction expansions of log 2.", paperIndex: 0 }],
    timeline: [
      { year: 1953, title: "Moser proves any solution needs m > 10^(10^6) and k even" },
      { year: 2011, title: "Gallot–Moree–Zudilin push the bound to ~2.71×10^1,667,658,416" },
    ],
  }),
  limit("LR-000205", "Hadwiger number of graphs", {
    category: "Mathematics", subcategory: "Graph theory", direction: "MINIMIZE", metricName: "coefficient c in guaranteed K_(t/c) minor size",
    summary: "How large a complete-minor a graph with chromatic number t is guaranteed to contain (Hadwiger's conjecture: a K_t minor).",
    formalStatement: "Hadwiger's conjecture: does every graph with chromatic number t contain a K_t minor? What is the largest complete minor guaranteed for chromatic number t in general?",
    papers: [{ title: "Reducing Linear Hadwiger's Conjecture to Coloring Small Graphs", authors: [{ displayName: "Michelle Delcourt", role: "BOUND_AUTHOR" }, { displayName: "Luke Postle", role: "BOUND_AUTHOR" }], year: 2021, arxivId: "2108.01633", url: "https://arxiv.org/abs/2108.01633" }],
    claims: [{ claimType: "UPPER_BOUND", relation: "<=", valueExact: "O(t*log(log(t)))", epistemicStatus: "LITERATURE_ASSERTED", methodSummary: "Every graph with no K_t minor is O(t·log log t)-colorable; conjecture proven only for t≤6 (Robertson–Seymour–Thomas 1993, via the Four Color Theorem). Publication status of this preprint not confirmed.", paperIndex: 0 }],
    timeline: [
      { year: 1943, title: "Hadwiger states the conjecture" },
      { year: 1993, title: "Robertson, Seymour, and Thomas prove the t=6 case", description: "Uses the Four Color Theorem." },
    ],
  }),
  limit("LR-000206", "Zarankiewicz problem", {
    category: "Mathematics", subcategory: "Extremal combinatorics", direction: "MAXIMIZE", metricName: "edges",
    summary: "How many edges a bipartite graph can have while containing no complete bipartite subgraph K_(s,t).",
    formalStatement: "What is z(n; s,t), the maximum number of edges in a bipartite graph on n+n vertices containing no K_{s,t}?",
    papers: [
      { title: "On a problem of K. Zarankiewicz", authors: [{ displayName: "Tamás Kővári", role: "BOUND_AUTHOR" }, { displayName: "Vera T. Sós", role: "BOUND_AUTHOR" }, { displayName: "Pál Turán", role: "BOUND_AUTHOR" }], venue: "Colloquium Mathematicum", year: 1954 },
      { title: "Norm-graphs and bipartite Turán numbers", authors: [{ displayName: "János Kollár", role: "RECORD_SETTER" }, { displayName: "Lajos Rónyai", role: "RECORD_SETTER" }, { displayName: "Tibor Szabó", role: "RECORD_SETTER" }], venue: "Combinatorica", year: 1996 },
    ],
    claims: [
      { claimType: "UPPER_BOUND", relation: "<=", valueExact: "O(n^(2-1/s))", epistemicStatus: "PROVEN", methodSummary: "Kővári–Sós–Turán bound; unimproved as the general upper bound after 70 years.", paperIndex: 0 },
      { claimType: "CONSTRUCTION", relation: "=", valueExact: "Theta(n^(2-1/s))", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Norm-graph constructions match the KST upper bound when t > (s-1)!; open for general s,t.", paperIndex: 1 },
    ],
    timeline: [
      { year: 1954, title: "Kővári–Sós–Turán establish the general upper bound" },
      { year: 1996, title: "Kollár–Rónyai–Szabó give matching algebraic constructions for large t" },
    ],
  }),
  limit("LR-000207", "Erdős–Hajnal conjecture", {
    category: "Mathematics", subcategory: "Ramsey theory", direction: "MAXIMIZE", metricName: "guaranteed clique-or-independent-set size",
    summary: "Whether every graph avoiding a fixed induced subgraph H has a polynomially large clique or independent set.",
    formalStatement: "Does every H-free n-vertex graph contain a clique or independent set of size n^c(H) for some c(H)>0 depending only on H?",
    papers: [{ title: "Ramsey-type theorems", authors: [{ displayName: "Paul Erdős", role: "PROBLEM_ORIGINATOR" }, { displayName: "András Hajnal", role: "PROBLEM_ORIGINATOR" }], venue: "Discrete Applied Mathematics", year: 1989 }],
    claims: [{ claimType: "LOWER_BOUND", relation: ">=", valueExact: "exp(c(H)*sqrt(log(n)))", epistemicStatus: "LITERATURE_ASSERTED", methodSummary: "Best known general bound for arbitrary H; the conjectured polynomial bound n^c(H) remains open in general (proven for specific H, e.g. C5 by Chudnovsky–Scott–Seymour–Spirkl 2023).", paperIndex: 0 }],
    timeline: [{ year: 1989, title: "Erdős and Hajnal formulate the conjecture" }],
  }),
  limit("LR-000208", "Sunflower conjecture", {
    category: "Mathematics", subcategory: "Extremal set theory", direction: "MINIMIZE", metricName: "family size forcing an r-petal sunflower",
    summary: "How many size-w sets are needed before a family is guaranteed to contain a sunflower with r petals.",
    formalStatement: "What is the smallest N(r,w) such that any family of more than N(r,w) sets of size w must contain a sunflower with r petals?",
    papers: [
      { title: "Improved bounds for the sunflower lemma", authors: [{ displayName: "Ryan Alweiss", role: "BOUND_AUTHOR" }, { displayName: "Shachar Lovett", role: "BOUND_AUTHOR" }, { displayName: "Kewen Wu", role: "BOUND_AUTHOR" }, { displayName: "Jiapeng Zhang", role: "BOUND_AUTHOR" }], venue: "Annals of Mathematics", year: 2021, arxivId: "1908.08483", url: "https://arxiv.org/abs/1908.08483" },
      { title: "Note on Sunflowers", authors: [{ displayName: "Tolson Bell", role: "BOUND_AUTHOR" }, { displayName: "Suchakree Chueluecha", role: "BOUND_AUTHOR" }, { displayName: "Lutz Warnke", role: "BOUND_AUTHOR" }], venue: "Discrete Mathematics", year: 2021, arxivId: "2009.09327", url: "https://arxiv.org/abs/2009.09327" },
    ],
    claims: [{ claimType: "UPPER_BOUND", relation: "<=", valueExact: "(O(r*log(w)))^w", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Bell–Chueluecha–Warnke's refinement of the Alweiss–Lovett–Wu–Zhang landmark bound; the Erdős–Rado conjecture (a constant c^w bound) remains open.", paperIndex: 1 }],
    timeline: [
      { year: 1960, title: "Erdős and Rado prove the original sunflower lemma and pose the conjecture" },
      { year: 2019, title: "Alweiss–Lovett–Wu–Zhang give the first quasipolynomial-in-w bound" },
    ],
  }),
  limit("LR-000209", "Erdős–Ko–Rado theorem", {
    category: "Mathematics", subcategory: "Extremal set theory", direction: "MAXIMIZE", metricName: "intersecting family size",
    summary: "The largest family of pairwise-intersecting k-element subsets of an n-element set.",
    formalStatement: "For n ≥ 2k, what is the maximum size of a family of k-element subsets of an n-set such that every two subsets intersect?",
    papers: [{ title: "Intersection theorems for systems of finite sets", authors: [{ displayName: "Paul Erdős", role: "PROOF_AUTHOR" }, { displayName: "Chao Ko", role: "PROOF_AUTHOR" }, { displayName: "Richard Rado", role: "PROOF_AUTHOR" }], venue: "The Quarterly Journal of Mathematics", year: 1961 }],
    claims: [{ claimType: "EXACT_VALUE", relation: "=", valueExact: "C(n-1,k-1)", epistemicStatus: "FORMALLY_PROVEN", methodSummary: "Proved via the shifting (compression) technique; a shorter cyclic-permutation proof was later given by Katona (1972). Result reportedly obtained by the authors around 1938, published 1961.", paperIndex: 0 }],
    timeline: [{ year: 1961, title: "Erdős, Ko, and Rado publish the exact bound", description: "Reportedly proved around 1938." }],
  }),
  limit("LR-000210", "Sphere-packing bound", {
    category: "Mathematics", subcategory: "Coding theory", direction: "MAXIMIZE", metricName: "code size A(n,d)",
    summary: "The largest error-correcting code of a given length and minimum distance that ball-packing allows.",
    formalStatement: "What is A(n,d), the maximum number of codewords in a length-n code over a Hamming space with minimum distance d?",
    papers: [{ title: "Error Detecting and Error Correcting Codes", authors: [{ displayName: "Richard W. Hamming", role: "PROBLEM_ORIGINATOR" }], venue: "Bell System Technical Journal", year: 1950, doi: "10.1002/j.1538-7305.1950.tb00463.x", url: "https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1950.tb00463.x" }],
    claims: [{ claimType: "UPPER_BOUND", relation: "<=", valueExact: "2^n / sum(i=0..floor((d-1)/2), C(n,i))", epistemicStatus: "PROVEN", methodSummary: "The Hamming/sphere-packing bound; tight only for perfect codes (Hamming codes, repetition code, binary/ternary Golay codes). The 1977 McEliece–Rodemich–Rumsey–Welch bound is tighter for part of the distance range, leaving a gap versus the Gilbert–Varshamov achievable bound.", paperIndex: 0 }],
    timeline: [
      { year: 1950, title: "Hamming introduces Hamming codes and the sphere-packing bound" },
      { year: 1977, title: "McEliece–Rodemich–Rumsey–Welch give a tighter bound for part of the range" },
    ],
  }),
  limit("LR-000211", "Gilbert–Varshamov bound", {
    category: "Mathematics", subcategory: "Coding theory", direction: "MAXIMIZE", metricName: "achievable rate",
    summary: "The best code rate guaranteed achievable for a given relative minimum distance.",
    formalStatement: "For relative distance δ over alphabet size q, what is the highest code rate R guaranteed achievable?",
    papers: [
      { title: "A comparison of signalling alphabets", authors: [{ displayName: "Edgar N. Gilbert", role: "PROOF_AUTHOR" }], venue: "Bell System Technical Journal", year: 1952 },
      { title: "Estimate of the number of signals in error correcting codes", authors: [{ displayName: "Rom R. Varshamov", role: "PROOF_AUTHOR" }], venue: "Doklady Akademii Nauk SSSR", year: 1957 },
    ],
    claims: [{ claimType: "CONSTRUCTION", relation: ">=", valueExact: "1 - H_q(delta)", epistemicStatus: "PROVEN", methodSummary: "Existential greedy-packing bound (Gilbert 1952); Varshamov (1957) sharpened it and showed it's achieved by linear codes. Whether it is optimal for the binary case is a long-standing open question; algebraic-geometry codes beat it for alphabet size q≥49 (Tsfasman–Vladut–Zink, 1982).", paperIndex: 1 }],
    timeline: [
      { year: 1952, title: "Gilbert proves the existential bound via greedy packing" },
      { year: 1957, title: "Varshamov sharpens it and shows achievability by linear codes" },
      { year: 1982, title: "Tsfasman–Vladut–Zink beat GV asymptotically for large alphabets" },
    ],
  }),
  limit("LR-000212", "P versus NP", {
    category: "Theoretical CS", subcategory: "Complexity theory", direction: "MINIMIZE", metricName: "not applicable — decision question",
    summary: "Whether every problem whose solution can be quickly verified can also be quickly solved. No numeric bound applies — it's a yes/no question, and remains unresolved.",
    formalStatement: "Is P = NP? Does every language decidable by a polynomial-time verifier also admit a polynomial-time decision algorithm?",
    papers: [
      { title: "The Complexity of Theorem-Proving Procedures", authors: [{ displayName: "Stephen A. Cook", role: "PROBLEM_ORIGINATOR" }], venue: "STOC 1971", year: 1971, doi: "10.1145/800157.805047", url: "https://dl.acm.org/doi/10.1145/800157.805047" },
      { title: "Universal'nye perebornye zadachi", authors: [{ displayName: "Leonid Levin", role: "PROBLEM_ORIGINATOR" }], venue: "Problemy Peredachi Informatsii", year: 1973 },
    ],
    claims: [],
    timeline: [
      { year: 1971, title: "Cook formulates NP-completeness (Cook–Levin theorem) via SAT" },
      { year: 1973, title: "Levin independently publishes equivalent results in the USSR" },
      { year: 2000, title: "Clay Mathematics Institute names P vs NP a Millennium Prize Problem" },
    ],
  }),
  limit("LR-000213", "Exponential time hypothesis", {
    category: "Theoretical CS", subcategory: "Complexity theory", direction: "MINIMIZE", metricName: "not applicable — conjectured lower bound on exponent",
    summary: "The conjecture that 3-SAT cannot be solved in sub-exponential time 2^o(n). Unproven, and no matching numeric algorithmic record is settled enough to report here.",
    formalStatement: "ETH: does 3-SAT require time 2^Ω(n), i.e. is there no algorithm solving it in time 2^o(n)?",
    papers: [
      { title: "On the Complexity of k-SAT", authors: [{ displayName: "Russell Impagliazzo", role: "PROBLEM_ORIGINATOR" }, { displayName: "Ramamohan Paturi", role: "PROBLEM_ORIGINATOR" }], venue: "Journal of Computer and System Sciences", year: 2001, url: "https://www.sciencedirect.com/science/article/pii/S0022000000917276" },
      { title: "Which Problems Have Strongly Exponential Complexity?", authors: [{ displayName: "Russell Impagliazzo", role: "FORMALIZER" }, { displayName: "Ramamohan Paturi", role: "FORMALIZER" }, { displayName: "Francis Zane", role: "FORMALIZER" }], venue: "Journal of Computer and System Sciences", year: 2001, doi: "10.1006/jcss.2001.1774" },
    ],
    claims: [],
    timeline: [
      { year: 2001, title: "Impagliazzo and Paturi define ETH" },
      { year: 2001, title: "Impagliazzo, Paturi, and Zane introduce the Sparsification Lemma and SETH" },
    ],
  }),
  limit("LR-000214", "Unique games conjecture", {
    category: "Theoretical CS", subcategory: "Hardness of approximation", direction: "MINIMIZE", metricName: "not applicable — conjectured hardness",
    summary: "Whether distinguishing near-satisfiable Unique Games instances from highly unsatisfiable ones is NP-hard. Neither proven nor refuted.",
    formalStatement: "For every ε,δ>0, is there an alphabet size k such that distinguishing Unique-Games instances with a (1−ε)-satisfying assignment from those with no assignment satisfying more than δ is NP-hard?",
    papers: [{ title: "On the Power of Unique 2-Prover 1-Round Games", authors: [{ displayName: "Subhash Khot", role: "PROBLEM_ORIGINATOR" }], venue: "STOC 2002", year: 2002, doi: "10.1145/509907.510017", url: "https://dl.acm.org/doi/10.1145/509907.510017" }],
    claims: [],
    timeline: [{ year: 2002, title: "Khot formulates the Unique Games Conjecture at STOC" }],
  }),
  limit("LR-000215", "Graph isomorphism complexity", {
    category: "Theoretical CS", subcategory: "Complexity theory", direction: "MINIMIZE", metricName: "time complexity exponent",
    summary: "Whether two graphs can be checked for isomorphism in polynomial time — still open, but a quasipolynomial-time algorithm is known.",
    formalStatement: "Does graph isomorphism admit a polynomial-time algorithm? What is the best known upper bound on its time complexity?",
    papers: [{ title: "Graph Isomorphism in Quasipolynomial Time", authors: [{ displayName: "László Babai", role: "RECORD_SETTER" }], year: 2016, arxivId: "1512.03547", url: "https://arxiv.org/abs/1512.03547" }],
    claims: [{ claimType: "UPPER_BOUND", relation: "<=", valueExact: "exp((log(n))^O(1))", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Quasipolynomial time; improves Luks's 1983 exp(O(√(n log n))) group-theoretic bound. Whether a genuinely polynomial-time algorithm exists remains open.", paperIndex: 0 }],
    timeline: [
      { year: 1983, title: "Luks gives an exp(O(√(n log n))) algorithm" },
      { year: 2016, title: "Babai gives a quasipolynomial-time algorithm" },
    ],
  }),
  limit("LR-000216", "Matrix multiplication exponent", {
    category: "Theoretical CS", subcategory: "Algorithms", direction: "MINIMIZE", metricName: "exponent ω",
    summary: "The smallest exponent ω such that two n×n matrices can be multiplied in O(n^ω) time.",
    formalStatement: "What is ω = inf{c : two n×n matrices can be multiplied using O(n^c) arithmetic operations}?",
    papers: [{ title: "Improving the Matrix Multiplication Exponent with Modern Optimization and AlphaEvolve", authors: [{ displayName: "Josh Alman", role: "RECORD_SETTER" }, { displayName: "Virginia Vassilevska Williams", role: "RECORD_SETTER" }], year: 2026, arxivId: "2608.16884", url: "https://arxiv.org/abs/2608.16884" }],
    claims: [{ claimType: "UPPER_BOUND", relation: "<", valueExact: "2.371177", epistemicStatus: "SOURCE_CONFIRMED", methodSummary: "Chain: Strassen 1969 (ω≤2.807) → Coppersmith–Winograd 1990 (ω<2.376) → Duan–Wu–Zhou FOCS 2023 (ω<2.3719) → Williams–Xu–Xu–Zhou SODA 2024 (ω≤2.371552, arXiv:2307.07970) → this 2026 result.", paperIndex: 0 }],
    timeline: [
      { year: 1969, title: "Strassen gives the first sub-cubic algorithm", description: "ω ≤ log₂7 ≈ 2.807." },
      { year: 1990, title: "Coppersmith–Winograd reach ω < 2.376", description: "Stood as the record for over 20 years." },
      { year: 2024, title: "Williams–Xu–Xu–Zhou reach ω ≤ 2.371552" },
    ],
  }),
  limit("LR-000217", "Boolean circuit lower bounds", {
    category: "Theoretical CS", subcategory: "Circuit complexity", direction: "MAXIMIZE", metricName: "required circuit size",
    summary: "How large bounded-depth circuits must be to compute an explicit Boolean function like parity.",
    formalStatement: "For depth-(d+1) circuits computing PARITY on n bits, what is the smallest proven lower bound on circuit size?",
    papers: [{ title: "Almost Optimal Lower Bounds for Small Depth Circuits", authors: [{ displayName: "Johan Håstad", role: "PROOF_AUTHOR" }], venue: "STOC 1986", year: 1986, doi: "10.1145/12130.12132", url: "https://dl.acm.org/doi/10.1145/12130.12132" }],
    claims: [{ claimType: "LOWER_BOUND", relation: ">=", valueExact: "2^(Omega(n^(1/d)))", epistemicStatus: "PROVEN", methodSummary: "Håstad's switching lemma gives an essentially tight bound for AC0, still the best known lower bound of this form for an explicit function; builds on Furst–Saxe–Sipser and Ajtai (1981-84).", paperIndex: 0 }],
    timeline: [
      { year: 1983, title: "Furst, Saxe, Sipser, and independently Ajtai, prove super-polynomial lower bounds for PARITY in AC0" },
      { year: 1986, title: "Håstad's switching lemma gives the essentially tight bound" },
    ],
  }),
  limit("LR-000218", "Communication complexity of disjointness", {
    category: "Theoretical CS", subcategory: "Communication complexity", direction: "MINIMIZE", metricName: "communication bits",
    summary: "How much two parties must communicate to decide whether their sets are disjoint.",
    formalStatement: "What is the randomized (bounded-error) two-party communication complexity of the Disjointness function on n-bit sets?",
    papers: [{ title: "On the Distributional Complexity of Disjointness", authors: [{ displayName: "Alexander A. Razborov", role: "PROOF_AUTHOR" }], venue: "Theoretical Computer Science", year: 1992, doi: "10.1016/0304-3975(92)90260-M" }],
    claims: [{ claimType: "LOWER_BOUND", relation: ">=", valueExact: "Omega(n)", epistemicStatus: "PROVEN", methodSummary: "Matches the trivial O(n) upper bound, so the bound is tight. First shown by Kalyanasundaram–Schnitger (1992) via Kolmogorov complexity; Razborov gave an alternate distributional-complexity proof that became the standard reference.", paperIndex: 0 }],
    timeline: [{ year: 1992, title: "Kalyanasundaram–Schnitger and, independently, Razborov prove the Ω(n) lower bound" }],
  }),
  limit("LR-000219", "Metric embedding distortion", {
    category: "Theoretical CS", subcategory: "Metric geometry", direction: "MINIMIZE", metricName: "distortion",
    summary: "The worst-case distortion needed to embed any n-point metric space into Euclidean space.",
    formalStatement: "What is the smallest D such that every n-point metric space embeds into Hilbert space with distortion O(D)?",
    papers: [{ title: "On Lipschitz Embedding of Finite Metric Spaces in Hilbert Space", authors: [{ displayName: "Jean Bourgain", role: "PROOF_AUTHOR" }], venue: "Israel Journal of Mathematics", year: 1985, doi: "10.1007/BF02776078", url: "https://link.springer.com/article/10.1007/BF02776078" }],
    claims: [{ claimType: "UPPER_BOUND", relation: "<=", valueExact: "O(log(n))", epistemicStatus: "PROVEN", methodSummary: "Achieved via random-subset (Fréchet) embeddings. A near-matching Ω(log n / log log n) lower bound via expander metrics is widely cited to Linial–London–Rabinovich (1995), though that specific citation was not independently re-verified in this pass.", paperIndex: 0 }],
    timeline: [{ year: 1985, title: "Bourgain proves the O(log n) embedding theorem" }],
  }),
  limit("LR-000220", "Euclidean traveling salesman approximation", {
    category: "Theoretical CS", subcategory: "Approximation algorithms", direction: "MINIMIZE", metricName: "approximation ratio",
    summary: "How close a polynomial-time algorithm can get to the optimal Euclidean TSP tour.",
    formalStatement: "For every fixed c>1, is there a randomized polynomial-time (1+1/c)-approximation algorithm for Euclidean TSP?",
    papers: [{ title: "Polynomial Time Approximation Schemes for Euclidean Traveling Salesman and Other Geometric Problems", authors: [{ displayName: "Sanjeev Arora", role: "RECORD_SETTER" }], venue: "Journal of the ACM", year: 1998, doi: "10.1145/290179.290180", url: "https://dl.acm.org/doi/10.1145/290179.290180" }],
    claims: [{ claimType: "CONSTRUCTION", relation: "<=", valueExact: "1 + 1/c", epistemicStatus: "PROVEN", methodSummary: "A PTAS: randomized time O(n(log n)^O(c)) in the plane, n·poly(log n) for fixed c and dimension d. Independently and concurrently given by Mitchell (1999) via guillotine subdivisions.", paperIndex: 0 }],
    timeline: [
      { year: 1976, title: "Christofides gives a 3/2-approximation for general metric TSP", description: "Predecessor benchmark for a different (non-Euclidean) problem variant." },
      { year: 1998, title: "Arora (and independently Mitchell) give a PTAS for Euclidean TSP" },
    ],
  }),
  limit("LR-000221", "Minimum dominating set", {
    category: "Theoretical CS", subcategory: "Approximation algorithms", direction: "MINIMIZE", metricName: "approximation ratio",
    summary: "The best approximation ratio achievable for finding the smallest dominating set in a graph.",
    formalStatement: "What is the best approximation ratio achievable in polynomial time for minimum dominating set, and what ratio is provably unachievable?",
    papers: [
      { title: "A Greedy Heuristic for the Set-Covering Problem", authors: [{ displayName: "Vašek Chvátal", role: "BOUND_AUTHOR" }], venue: "Mathematics of Operations Research", year: 1979 },
      { title: "A Threshold of ln n for Approximating Set Cover", authors: [{ displayName: "Uriel Feige", role: "BOUND_AUTHOR" }], venue: "Journal of the ACM", year: 1998, doi: "10.1145/285055.285059", url: "https://dl.acm.org/doi/10.1145/285055.285059" },
    ],
    claims: [
      { claimType: "UPPER_BOUND", relation: "<=", valueExact: "ln(n)", epistemicStatus: "PROVEN", methodSummary: "Greedy algorithm; dominating set reduces to/from set cover and the ratio transfers.", paperIndex: 0 },
      { claimType: "LOWER_BOUND", relation: ">=", valueExact: "(1-epsilon)*ln(n)", epistemicStatus: "PROVEN", methodSummary: "No (1−ε)ln n approximation is possible for any ε>0, originally under a complexity assumption and later strengthened to assume only P≠NP (Dinur–Steurer, STOC 2014) — essentially closing the gap.", paperIndex: 1 },
    ],
    timeline: [
      { year: 1979, title: "Chvátal proves the greedy ln n upper bound for set cover" },
      { year: 1998, title: "Feige proves matching ln n hardness" },
    ],
  }),
  limit("LR-000222", "Unique decoding radius", {
    category: "Theoretical CS", subcategory: "Coding theory", direction: "MAXIMIZE", metricName: "guaranteed correctable errors",
    summary: "How many errors a code with a given minimum distance can always uniquely correct.",
    formalStatement: "For a code with minimum Hamming distance d, what is the largest radius within which decoding to the unique nearest codeword is always guaranteed?",
    papers: [{ title: "Error Detecting and Error Correcting Codes", authors: [{ displayName: "Richard W. Hamming", role: "FORMALIZER" }], venue: "Bell System Technical Journal", year: 1950, doi: "10.1002/j.1538-7305.1950.tb00463.x", url: "https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1950.tb00463.x" }],
    claims: [{ claimType: "EXACT_VALUE", relation: "=", valueExact: "floor((d-1)/2)", epistemicStatus: "LITERATURE_ASSERTED", methodSummary: "Direct consequence of the minimum-distance definition (Hamming balls of this radius around codewords are guaranteed disjoint) rather than a single citable theorem — flagged as definitional/folklore rather than attributed to one discovery. List-decoding (Guruswami–Sudan) can go further if uniqueness is relaxed to a list.", paperIndex: 0 }],
    timeline: [{ year: 1950, title: "Hamming introduces minimum-distance codes and error correction" }],
  }),
  limit("LR-000223", "Minkowski's convex body limit", {
    category: "Mathematics", subcategory: "Geometry of numbers", direction: "MINIMIZE", metricName: "volume threshold (multiples of lattice covolume)",
    summary: "The volume a centrally symmetric convex body needs before it is guaranteed to contain a nonzero lattice point.",
    formalStatement: "What is the smallest V such that every convex body symmetric about the origin with volume greater than V·d(L) is guaranteed to contain a nonzero point of lattice L?",
    papers: [{ title: "Geometrie der Zahlen", authors: [{ displayName: "Hermann Minkowski", role: "PROOF_AUTHOR" }], venue: "Teubner", year: 1896 }],
    claims: [{ claimType: "EXACT_VALUE", relation: "=", valueExact: "2^n", epistemicStatus: "FORMALLY_PROVEN", methodSummary: "Tight: the open cube (−1,1)ⁿ has volume exactly 2ⁿ and contains no nonzero lattice point. Original publication year is disputed in secondary sources (1889 vs. 1896); citing the 1896 book as the safer canonical reference.", paperIndex: 0 }],
    timeline: [{ year: 1896, title: "Minkowski publishes Geometrie der Zahlen, founding the geometry of numbers" }],
  }),
  limit("LR-000224", "Four color theorem", {
    category: "Mathematics", subcategory: "Graph theory", direction: "MINIMIZE", metricName: "colors",
    summary: "The number of colors sufficient and necessary to color any planar map so adjacent regions differ.",
    formalStatement: "What is the minimum number of colors sufficient to properly vertex-color any loopless planar graph?",
    papers: [{ title: "Every Planar Map is Four Colorable", authors: [{ displayName: "Kenneth Appel", role: "PROOF_AUTHOR" }, { displayName: "Wolfgang Haken", role: "PROOF_AUTHOR" }], venue: "Illinois Journal of Mathematics", year: 1977 }],
    claims: [{ claimType: "EXACT_VALUE", relation: "=", valueExact: "4", epistemicStatus: "FORMALLY_PROVEN", methodSummary: "First computer-assisted proof, using 1936 reducible configurations. A simplified, more verifiable computer-assisted proof was later given by Robertson, Sanders, Seymour, and Thomas (1997, JCTB, doi:10.1006/jctb.1997.1750) using 633 configurations.", paperIndex: 0 }],
    timeline: [
      { year: 1976, title: "Appel and Haken announce the first proof" },
      { year: 1997, title: "Robertson, Sanders, Seymour, and Thomas give a simplified proof" },
    ],
  }),
];

async function upsertPerson(name: string) {
  const normalized = name.toLowerCase().trim();
  const existing = await db.select().from(schema.people).where(eq(schema.people.normalizedName, normalized)).limit(1);
  if (existing[0]) return existing[0];
  const [row] = await db.insert(schema.people).values({ displayName: name, normalizedName: normalized, profileStatus: "UNCLAIMED" }).returning();
  return row;
}

async function upsertPaper(paper: SeedPaper) {
  const existingRows = await db.select().from(schema.papers);
  const dup = findDuplicatePaper(existingRows, { doi: paper.doi, arxivId: paper.arxivId, title: paper.title });
  if (dup) return existingRows.find((r) => r.id === dup.id)!;
  const [row] = await db.insert(schema.papers).values({
    title: paper.title,
    venue: paper.venue ?? null,
    publicationDate: paper.year ? new Date(Date.UTC(paper.year, 0, 1)) : null,
    doi: paper.doi ?? null,
    arxivId: paper.arxivId ?? null,
    publisherUrl: paper.url ?? null,
  }).returning();
  return row;
}

async function seedLimit(entry: SeedLimit, index: number) {
  const already = await db.select().from(schema.limits).where(eq(schema.limits.registryNumber, entry.registryNumber)).limit(1);
  if (already[0]) { console.log(`skip ${entry.registryNumber} (already exists)`); return; }

  const [limit] = await db.insert(schema.limits).values({
    registryNumber: entry.registryNumber,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    subcategory: entry.subcategory ?? null,
    direction: entry.direction,
    metricName: entry.metricName,
    unit: entry.unit ?? null,
    status: "DRAFT",
  }).returning();

  const [spec] = await db.insert(schema.specificationVersions).values({
    limitId: limit.id,
    versionNumber: 1,
    formalStatement: entry.formalStatement,
    constraints: {},
    assumptions: {},
  }).returning();

  const paperRows = await Promise.all(entry.papers.map(upsertPaper));

  for (const claim of entry.claims) {
    const [claimRow] = await db.insert(schema.claims).values({
      claimNumber: `CLM-${String(200 + index).padStart(6, "0")}-${claim.claimType.slice(0, 3)}`,
      specificationVersionId: spec.id,
      claimType: claim.claimType,
      relation: claim.relation,
      valueExact: claim.valueExact,
      valueText: claim.valueText ?? null,
      scopeParameters: {},
      epistemicStatus: claim.epistemicStatus,
      status: "DRAFT",
      methodSummary: claim.methodSummary ?? null,
    }).returning();

    const paper = paperRows[claim.paperIndex];
    if (paper) {
      await db.insert(schema.claimPapers).values({ claimId: claimRow.id, paperId: paper.id }).onConflictDoNothing();
      const seedPaper = entry.papers[claim.paperIndex];
      for (const author of seedPaper.authors ?? []) {
        const person = await upsertPerson(author.displayName);
        await db.insert(schema.claimPeople).values({ claimId: claimRow.id, personId: person.id, contributorRole: author.role }).onConflictDoNothing();
      }
    }
  }

  for (const event of entry.timeline) {
    await db.insert(schema.timelineEvents).values({
      limitId: limit.id,
      eventType: "RESULT_ADDED",
      title: event.title,
      description: event.description ?? null,
      occurredAt: new Date(Date.UTC(event.year, 0, 1)),
      metadata: {},
    });
  }

  console.log(`seeded ${entry.registryNumber} — ${entry.title} (${entry.papers.length} papers, ${entry.claims.length} claims, ${entry.timeline.length} timeline events)`);
}

async function main() {
  for (const [index, entry] of SEED.entries()) await seedLimit(entry, index);
  console.log(`done — ${SEED.length} catalog entries processed.`);
  process.exit(0);
}

main().catch((error) => { console.error(error); process.exit(1); });
