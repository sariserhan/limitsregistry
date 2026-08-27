export type CatalogCandidate = { registryNumber: string; title: string; field: "Mathematics" | "Theoretical CS"; formalQuestion: string; primarySource: string; sourceType: "PAPER" | "SURVEY"; status: "DRAFT"; verification: "PENDING_EDITORIAL_REVIEW" };

/** Candidate records are deliberately DRAFT: no quantitative statement is public until evidence and independent review are attached. */
export const launchCatalog: CatalogCandidate[] = [
  ["Maximum edges in a triangle-free graph", "How many edges can an n-vertex triangle-free graph have?", ""],
  ["Chromatic number of the plane", "What is the minimum number of colors required for the unit-distance graph of the plane?", ""],
  ["The Černý conjecture", "What is the maximum shortest synchronizing-word length of an n-state synchronizing automaton?", "https://arxiv.org/abs/1405.2435"],
  ["Largest cap set in [3]^n", "How large can a subset of [3]^n be with no three points on a line?", ""],
  ["Erdős–Moser equation", "Can 1^k+2^k+...+(m-1)^k=m^k hold for k>1?", ""],
  ["Hadwiger number of graphs", "How large a complete minor must a graph of chromatic number t contain?", ""],
  ["Zarankiewicz problem", "How many edges can a bipartite graph have while avoiding K_{s,t}?", ""],
  ["Erdős–Hajnal conjecture", "Does every graph with no induced H have a polynomial-size clique or independent set?", ""],
  ["Sunflower conjecture", "How many sets force a sunflower in a uniform family?", ""],
  ["Erdős–Ko–Rado theorem", "What is the maximum intersecting subfamily of k-subsets of an n-set?", ""],
  ["Sphere-packing bound", "What is the largest size of a code with minimum distance d in a Hamming space?", ""],
  ["Gilbert–Varshamov bound", "What rate and relative distance can error-correcting codes achieve?", ""],
  ["P versus NP", "Does every efficiently verifiable language have an efficient algorithm?", ""],
  ["Exponential time hypothesis", "Can 3-SAT be solved in time 2^{o(n)}?", ""],
  ["Unique games conjecture", "Is distinguishing nearly satisfiable from highly unsatisfiable constraint instances hard?", ""],
  ["Graph isomorphism complexity", "Does graph isomorphism admit a polynomial-time algorithm?", ""],
  ["Matrix multiplication exponent", "What is the infimum exponent for multiplying two n by n matrices?", ""],
  ["Boolean circuit lower bounds", "How large must bounded-depth circuits be for explicit Boolean functions?", ""],
  ["Communication complexity of disjointness", "What communication is required to decide set disjointness?", ""],
  ["Metric embedding distortion", "What distortion is required to embed finite metric spaces into target norms?", ""],
  ["Euclidean traveling salesman approximation", "How closely can polynomial algorithms approximate Euclidean TSP?", ""],
  ["Minimum dominating set", "What approximation ratio is possible for minimum dominating set?", ""],
  ["Unique decoding radius", "How far can a code uniquely correct errors under a given metric?", ""],
  ["Minkowski’s convex body limit", "What volume guarantees a nonzero lattice point in a symmetric convex body?", ""],
  ["Four color theorem", "How many colors are sufficient and necessary for planar maps?", ""],
].map(([title, formalQuestion, primarySource], index) => ({ registryNumber: `LR-${String(index + 200).padStart(6, "0")}`, title, field: index < 12 ? "Mathematics" : "Theoretical CS", formalQuestion, primarySource, sourceType: "PAPER", status: "DRAFT", verification: "PENDING_EDITORIAL_REVIEW" }));

export function canPublishCandidate(candidate: CatalogCandidate, hasEvidence: boolean, independentReviews: number) { return candidate.status === "DRAFT" && hasEvidence && independentReviews >= 2; }
