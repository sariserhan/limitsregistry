export type BrowseLimit = {
  id: string; title: string; category: string; status: "OPEN" | "PROVEN" | "DISPUTED" | "RETIRED"; direction: "MAXIMIZE" | "MINIMIZE"; summary: string;
  achievable: string; bound: string; gap: string; claims: number; papers: number;
};

export const browseLimits: BrowseLimit[] = [
  { id: "LR-000127", title: "Maximum edges in a triangle-free graph", category: "Graph theory", status: "PROVEN", direction: "MAXIMIZE", summary: "How dense can a graph be while containing no triangle?", achievable: "n² / 4", bound: "n² / 4", gap: "Closed", claims: 18, papers: 9 },
  { id: "LR-000114", title: "Synchronizing automaton reset threshold", category: "Automata", status: "OPEN", direction: "MINIMIZE", summary: "The maximum shortest reset-word length among synchronizing n-state finite automata.", achievable: "(n − 1)²", bound: "0.1654n³ + O(n²)", gap: "Černý conjecture open", claims: 24, papers: 17 },
  { id: "LR-000098", title: "Largest cap set in F₃ⁿ", category: "Combinatorics", status: "OPEN", direction: "MAXIMIZE", summary: "The largest subset of F₃ⁿ containing no non-trivial three-term arithmetic progression.", achievable: "≥ 2.218ⁿ", bound: "O(2.756ⁿ)", gap: "Asymptotic", claims: 31, papers: 22 },
  { id: "LR-000086", title: "Minimum distance of primitive binary BCH codes", category: "Coding theory", status: "OPEN", direction: "MAXIMIZE", summary: "The true minimum Hamming distance of a primitive narrow-sense binary BCH family of length 2ᵐ − 1.", achievable: "δ", bound: "Unknown", gap: "Family-dependent", claims: 12, papers: 8 },
  { id: "LR-000072", title: "Chromatic number of the plane", category: "Optimization", status: "OPEN", direction: "MINIMIZE", summary: "The fewest colors needed so that unit-distance points differ.", achievable: "5", bound: "7", gap: "2 colors", claims: 27, papers: 19 },
  { id: "LR-000140", title: "Matrix multiplication exponent", category: "Algebraic complexity", status: "OPEN", direction: "MINIMIZE", summary: "The infimum exponent ω such that two n×n matrices can be multiplied in O(nω) arithmetic operations.", achievable: "2", bound: "2.371339", gap: "Unknown", claims: 14, papers: 11 },
  { id: "LR-000141", title: "Sphere packing density in 8 dimensions", category: "Discrete geometry", status: "PROVEN", direction: "MAXIMIZE", summary: "The greatest fraction of 8-dimensional space fillable by non-overlapping equal spheres.", achievable: "π⁴ / 384", bound: "π⁴ / 384", gap: "Closed", claims: 6, papers: 4 },
  { id: "LR-000142", title: "Sphere packing density in 24 dimensions", category: "Discrete geometry", status: "PROVEN", direction: "MAXIMIZE", summary: "The greatest fraction of 24-dimensional space fillable by non-overlapping equal spheres.", achievable: "π¹² / 12!", bound: "π¹² / 12!", gap: "Closed", claims: 5, papers: 3 },
  { id: "LR-000143", title: "Diagonal Ramsey number growth rate", category: "Ramsey theory", status: "OPEN", direction: "MAXIMIZE", summary: "The base of exponential growth of R(k,k), the smallest n guaranteeing a monochromatic k-clique or independent set in any 2-coloring of Kₙ.", achievable: "≥ (√2)ᵏ", bound: "O(3.8ᵏ)", gap: "Asymptotic", claims: 21, papers: 15 },
];

export const browseClaims = [
  { id: "CLM-000431", relation: "L ≥ 5", kind: "CONSTRUCTION", status: "SOURCE_CONFIRMED", source: "de Grey, 2018", detail: "A finite coloring establishes a lower bound under specification v2." },
  { id: "CLM-000208", relation: "L ≤ 7", kind: "UPPER_BOUND", status: "PROVEN", source: "Exoo & Ismailescu, 2019", detail: "Theorem 2 establishes the upper bound under specification v2." },
  { id: "CLM-000119", relation: "L ≥ 4", kind: "LOWER_BOUND", status: "PROVEN", source: "Erdős et al., 1950", detail: "The original construction remains valid under the current specification." },
];

export function getBrowseLimit(id: string): BrowseLimit | undefined { return browseLimits.find((limit) => limit.id === id); }
