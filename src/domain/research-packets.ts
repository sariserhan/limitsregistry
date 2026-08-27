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
