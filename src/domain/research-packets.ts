import type { ResearchPacket } from "./research-packet";
import type { Claim, Evidence, SpecificationVersion } from "./types";

const spec: SpecificationVersion = {
  id: "SP-LR-000127-V1", limitId: "LR-000127", version: 1,
  formalStatement: "ex(n, K₃) is the maximum number of edges in a simple n-vertex graph containing no triangle.",
  constraints: { graph: "simple", vertices: "n", forbiddenSubgraph: "K₃" }, asymptotic: false, probabilistic: false,
};
const evidence: Evidence = { id: "EVD-LR127-1", type: "MATHEMATICAL_PROOF", method: "MANTEL_THEOREM", verificationLevel: "SOURCE_CONFIRMED", label: "Mantel's theorem and balanced complete bipartite construction", sourceUrl: "https://ocw.mit.edu/courses/18-225-graph-theory-and-additive-combinatorics-fall-2023/mit18_225_f23_lec_full.pdf" };
const claim = (id: string, relation: Claim["relation"], type: Claim["claimType"], value: string, author: string, year: number): Claim => ({ id, specificationVersionId: spec.id, relation, value: { kind: "text", value }, claimType: type, status: "ACCEPTED", epistemicStatus: "SOURCE_CONFIRMED", scientificStatus: "ACCEPTED", registryReviewStatus: "UNREVIEWED", evidenceIds: [evidence.id], author, year, source: evidence.label });

export const mantelResearchPacket: ResearchPacket = {
  limit: { id: "LR-000127", title: "Maximum edges in a triangle-free graph", category: "Graph Theory", status: "PROVEN", direction: "MAXIMIZE", summary: "The maximum number of edges in a simple n-vertex graph containing no triangle." },
  specification: spec,
  claims: [
    claim("CLM-LR127-LOWER", ">=", "CONSTRUCTION", "floor(n²/4)", "Willem Mantel", 1907),
    claim("CLM-LR127-UPPER", "<=", "UPPER_BOUND", "floor(n²/4)", "Willem Mantel", 1907),
  ],
  evidence: [evidence], registryReviewStatus: "UNREVIEWED",
};


const packetSpec = (id: string, limitId: string, formalStatement: string, constraints: Record<string, string>, asymptotic = true): SpecificationVersion => ({ id, limitId, version: 1, formalStatement, constraints, asymptotic, probabilistic: false });
const textClaim = (id: string, specId: string, relation: Claim["relation"], value: string, claimType: Claim["claimType"], author: string, year: number, source: string, evidenceId: string, scientificStatus: Claim["scientificStatus"] = "ACCEPTED"): Claim => ({ id, specificationVersionId: specId, relation, value: { kind: "text", value }, claimType, status: "ACCEPTED", epistemicStatus: scientificStatus === "UNCERTAIN" ? "LITERATURE_ASSERTED" : "SOURCE_CONFIRMED", scientificStatus, registryReviewStatus: "UNREVIEWED", evidenceIds: [evidenceId], author, year, source });

const cernySpec = packetSpec("SP-LR-000114-V1", "LR-000114", "C(n) is the maximum shortest reset-word length over synchronizing complete deterministic automata with n states.", { automaton: "complete DFA", states: "n", quantity: "reset threshold" }, true);
const cernyEvidence: Evidence = { id: "EVD-LR114-1", type: "MATHEMATICAL_PROOF", method: "AUTOMATON_CONSTRUCTION", verificationLevel: "SOURCE_CONFIRMED", label: "Černý automata attain (n−1)²; general quadratic upper bound remains conjectural", sourceUrl: "https://doi.org/10.1145/3798283" };
export const cernyResearchPacket: ResearchPacket = { limit: { id: "LR-000114", title: "Synchronizing automaton reset threshold", category: "Automata", status: "OPEN", direction: "MINIMIZE", summary: "The maximum shortest reset-word length among synchronizing n-state finite automata." }, specification: cernySpec, claims: [ textClaim("CLM-LR114-LOWER", cernySpec.id, ">=", "(n−1)²", "LOWER_BOUND", "Jan Černý", 1964, "Černý automata construction", cernyEvidence.id), textClaim("CLM-LR114-CONJECTURE", cernySpec.id, "<=", "(n−1)²", "UPPER_BOUND", "Černý conjecture", 1969, "Černý conjecture", cernyEvidence.id, "UNCERTAIN"), textClaim("CLM-LR114-UPPER-CUBIC", cernySpec.id, "<=", "0.1654n³ + O(n²)", "UPPER_BOUND", "Yaroslav Shitov", 2022, "Best known general cubic upper bound", cernyEvidence.id) ], evidence: [cernyEvidence], registryReviewStatus: "UNREVIEWED" };

const capSpec = packetSpec("SP-LR-000098-V1", "LR-000098", "A cap set is a subset of F₃ⁿ with no non-trivial solution to x+y+z=0.", { domain: "F₃ⁿ", forbiddenConfiguration: "non-trivial 3-term arithmetic progression" });
const capEvidence: Evidence = { id: "EVD-LR098-1", type: "MATHEMATICAL_PROOF", method: "POLYNOMIAL_METHOD", verificationLevel: "SOURCE_CONFIRMED", label: "Polynomial-method upper bound for cap sets", sourceUrl: "https://doi.org/10.1016/j.jcta.2019.06.001" };
const capLowerEvidence: Evidence = { id: "EVD-LR098-2", type: "CONSTRUCTION", method: "EXPLICIT_CONSTRUCTION", verificationLevel: "SOURCE_CONFIRMED", label: "Improved exponential lower bound for cap sets", sourceUrl: "https://arxiv.org/abs/2209.10045" };
export const capSetResearchPacket: ResearchPacket = { limit: { id: "LR-000098", title: "Largest cap set in F₃ⁿ", category: "Combinatorics", status: "OPEN", direction: "MAXIMIZE", summary: "The largest subset of F₃ⁿ containing no non-trivial three-term arithmetic progression." }, specification: capSpec, claims: [ textClaim("CLM-LR098-LOWER", capSpec.id, ">=", "2.218ⁿ", "LOWER_BOUND", "Fred Tyrrell", 2022, "New Lower Bounds for Cap Sets", capLowerEvidence.id), textClaim("CLM-LR098-UPPER", capSpec.id, "<=", "O(2.756ⁿ)", "UPPER_BOUND", "Jordan Ellenberg and Dion Gijswijt", 2016, "Bounds on sizes of generalized caps", capEvidence.id) ], evidence: [capLowerEvidence, capEvidence], registryReviewStatus: "UNREVIEWED" };

const bchSpec = packetSpec("SP-LR-000086-V1", "LR-000086", "d(C) is the true minimum Hamming distance of a primitive narrow-sense binary BCH code of length 2ᵐ−1 and designed distance δ.", { field: "F₂", family: "primitive narrow-sense BCH", length: "2ᵐ−1", parameter: "m and δ" }, false);
const bchEvidence: Evidence = { id: "EVD-LR086-1", type: "MATHEMATICAL_PROOF", method: "BCH_BOUND", verificationLevel: "SOURCE_CONFIRMED", label: "BCH designed-distance guarantee", sourceUrl: "https://www.aimsciences.org/article/doi/10.3934/amc.2024047?viewType=HTML" };
export const bchResearchPacket: ResearchPacket = { limit: { id: "LR-000086", title: "Minimum distance of primitive binary BCH codes", category: "Coding theory", status: "OPEN", direction: "MAXIMIZE", summary: "The true minimum Hamming distance of a primitive narrow-sense binary BCH family of length 2ᵐ − 1." }, specification: bchSpec, claims: [ textClaim("CLM-LR086-DESIGNED", bchSpec.id, ">=", "δ", "LOWER_BOUND", "BCH bound", 1959, "The designed distance is a lower bound on true minimum distance", bchEvidence.id) ], evidence: [bchEvidence], registryReviewStatus: "UNREVIEWED" };

export const additionalResearchPackets: ResearchPacket[] = [cernyResearchPacket, capSetResearchPacket, bchResearchPacket];

const sortingSpec = (id: string, limitId: string, inputs: number): SpecificationVersion => ({ id, limitId, version: 1, formalStatement: `S(${inputs}) is the minimum number of comparators in a fixed network that sorts every ${inputs}-input sequence.`, constraints: { inputs: String(inputs), inputDomain: "totally ordered values", verificationDomain: `${2 ** inputs} binary inputs`, network: "fixed/data-oblivious" }, asymptotic: false, probabilistic: false });
const sortingEvidence = (id: string, label: string): Evidence => ({ id, type: "COMPUTATIONAL_PROOF", method: "SAT_SYMMETRY_REDUCTION", verificationLevel: "SOURCE_CONFIRMED", label, sourceUrl: "https://arxiv.org/abs/1405.5754" });
const sortingPacket = (limitId: string, inputs: number, lower: number, upper: number, status: "OPEN" | "PROVEN", lowerSource: string, upperSource: string): ResearchPacket => {
  const specification = sortingSpec(`SP-${limitId}-V1`, limitId, inputs);
  const lowerEvidence = sortingEvidence(`EVD-${limitId}-LOWER`, `Computer-assisted lower-bound verification for S(${inputs})`);
  const upperEvidence: Evidence = { id: `EVD-${limitId}-UPPER`, type: "CONSTRUCTION", method: "COMPARATOR_NETWORK", verificationLevel: "SOURCE_CONFIRMED", label: `Known ${upper}-comparator sorting network for ${inputs} inputs`, sourceUrl: "https://imada.sdu.dk/~petersk/sn/" };
  const makeClaim = (id: string, relation: Claim["relation"], value: number, type: Claim["claimType"], source: string, evidenceId: string): Claim => ({ id, specificationVersionId: specification.id, relation, value: { kind: "integer", value: BigInt(value) }, claimType: type, status: "ACCEPTED", epistemicStatus: "SOURCE_CONFIRMED", scientificStatus: "ACCEPTED", registryReviewStatus: "UNREVIEWED", evidenceIds: [evidenceId], author: "Codish, Cruz-Filipe, Frank, Schneider-Kamp", year: 2014, source });
  return { limit: { id: limitId, title: `Minimum number of comparators for a ${inputs}-input sorting network`, category: "Algorithms / Sorting Networks", status, direction: "MINIMIZE", summary: `The minimum number of fixed compare-exchange operations needed to sort ${inputs} inputs.` }, specification, claims: [makeClaim(`CLM-${limitId}-LOWER`, ">=", lower, "LOWER_BOUND", lowerSource, lowerEvidence.id), makeClaim(`CLM-${limitId}-UPPER`, "<=", upper, "UPPER_BOUND", upperSource, upperEvidence.id)], evidence: [lowerEvidence, upperEvidence], registryReviewStatus: "UNREVIEWED" };
};

export const sortingNetworkResearchPackets: ResearchPacket[] = [
  sortingPacket("LR-SN-009", 9, 25, 25, "PROVEN", "Twenty-Five Comparators is Optimal when Sorting Nine Inputs", "Floyd's 25-comparator construction"),
  sortingPacket("LR-SN-010", 10, 29, 29, "PROVEN", "Twenty-Five Comparators is Optimal when Sorting Nine Inputs (and Twenty-Nine for Ten)", "Waksman's 29-comparator construction"),
  sortingPacket("LR-SN-011", 11, 33, 35, "OPEN", "Maintained sorting-network lower-bound table", "Maintained sorting-network upper-bound table"),
  sortingPacket("LR-SN-012", 12, 37, 39, "OPEN", "Maintained sorting-network lower-bound table", "Maintained sorting-network upper-bound table"),
];
