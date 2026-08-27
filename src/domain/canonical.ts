export type CanonicalRecord = {
  id: string; category: string; title: string; summary: string; achievable: string; bound: string; gap: string; mode: "integer" | "asymptotic";
};

export const canonicalRecords: Record<string, CanonicalRecord> = {
  "LR-000072": { id: "LR-000072", category: "MATHEMATICS / OPTIMIZATION", title: "Chromatic number of the plane", summary: "What is the fewest number of colors needed to color every point in the plane so that points exactly one unit apart receive different colors?", achievable: "5", bound: "7", gap: "2 colors", mode: "integer" },
  "LR-000127": { id: "LR-000127", category: "MATHEMATICS / GRAPH THEORY", title: "Maximum edges in a triangle-free graph", summary: "How dense can a graph be while containing no triangle?", achievable: "n² / 4", bound: "n² / 4", gap: "Closed", mode: "integer" },
  "LR-000098": { id: "LR-000098", category: "MATHEMATICS / COMBINATORICS", title: "Largest cap set in [3]ⁿ", summary: "The largest subset of a grid containing no three points in a line.", achievable: "Θ(3ⁿ / n)", bound: "O(3ⁿ / n¹·⁶)", gap: "Asymptotic", mode: "asymptotic" },
};

export function getCanonicalRecord(id: string): CanonicalRecord | undefined { return canonicalRecords[id]; }
