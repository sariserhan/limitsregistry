export type BrowseLimit = {
  id: string; title: string; category: string; status: "OPEN" | "PROVEN"; direction: "MAXIMIZE" | "MINIMIZE"; summary: string;
  achievable: string; bound: string; gap: string; claims: number; papers: number;
};

export const browseLimits: BrowseLimit[] = [
  { id: "LR-000127", title: "Maximum edges in a triangle-free graph", category: "Graph theory", status: "PROVEN", direction: "MAXIMIZE", summary: "How dense can a graph be while containing no triangle?", achievable: "n² / 4", bound: "n² / 4", gap: "Closed", claims: 18, papers: 9 },
  { id: "LR-000114", title: "Shortest synchronizing word", category: "Automata", status: "OPEN", direction: "MINIMIZE", summary: "The shortest reset sequence for a synchronizing finite automaton.", achievable: "(n − 1)²", bound: "(n − 1)²", gap: "Open for n ≥ 3", claims: 24, papers: 17 },
  { id: "LR-000098", title: "Largest cap set in [3]ⁿ", category: "Combinatorics", status: "OPEN", direction: "MAXIMIZE", summary: "The largest subset of a grid containing no three points in a line.", achievable: "Θ(3ⁿ / n)", bound: "O(3ⁿ / n¹·⁶)", gap: "Asymptotic", claims: 31, papers: 22 },
  { id: "LR-000086", title: "Minimum distance of binary BCH codes", category: "Coding theory", status: "OPEN", direction: "MAXIMIZE", summary: "How much error separation can the construction guarantee?", achievable: "2t + 1", bound: "Unknown", gap: "Unbounded", claims: 12, papers: 8 },
  { id: "LR-000072", title: "Chromatic number of the plane", category: "Optimization", status: "OPEN", direction: "MINIMIZE", summary: "The fewest colors needed so that unit-distance points differ.", achievable: "5", bound: "7", gap: "2 colors", claims: 27, papers: 19 },
];

export const browseClaims = [
  { id: "CLM-000431", relation: "L ≥ 5", kind: "CONSTRUCTION", status: "SOURCE_CONFIRMED", source: "de Grey, 2018", detail: "A finite coloring establishes a lower bound under specification v2." },
  { id: "CLM-000208", relation: "L ≤ 7", kind: "UPPER_BOUND", status: "PROVEN", source: "Exoo & Ismailescu, 2019", detail: "Theorem 2 establishes the upper bound under specification v2." },
  { id: "CLM-000119", relation: "L ≥ 4", kind: "LOWER_BOUND", status: "PROVEN", source: "Erdős et al., 1950", detail: "The original construction remains valid under the current specification." },
];

export function getBrowseLimit(id: string): BrowseLimit | undefined { return browseLimits.find((limit) => limit.id === id); }
