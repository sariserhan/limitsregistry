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
];

export const browseClaims = [
  { id: "CLM-000431", relation: "L ≥ 5", kind: "CONSTRUCTION", status: "SOURCE_CONFIRMED", source: "de Grey, 2018", detail: "A finite coloring establishes a lower bound under specification v2." },
  { id: "CLM-000208", relation: "L ≤ 7", kind: "UPPER_BOUND", status: "PROVEN", source: "Exoo & Ismailescu, 2019", detail: "Theorem 2 establishes the upper bound under specification v2." },
  { id: "CLM-000119", relation: "L ≥ 4", kind: "LOWER_BOUND", status: "PROVEN", source: "Erdős et al., 1950", detail: "The original construction remains valid under the current specification." },
];

export function getBrowseLimit(id: string): BrowseLimit | undefined { return browseLimits.find((limit) => limit.id === id); }
