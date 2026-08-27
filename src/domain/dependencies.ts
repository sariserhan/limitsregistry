export const DEPENDENCY_RELATIONS = ["REDUCES_TO", "DEPENDS_ON", "IMPROVES", "GENERALIZES"] as const;
export type DependencyRelation = (typeof DEPENDENCY_RELATIONS)[number];
export type DependencyReviewStatus = "DRAFT" | "ACCEPTED" | "REJECTED";
export type DependencyEdge = { sourceLimitId: string; targetLimitId: string; relation: string; reviewStatus?: string };

export const dependencyLabel = (relation: string) => ({ REDUCES_TO: "reduces to", DEPENDS_ON: "depends on", IMPROVES: "improves", GENERALIZES: "generalizes" }[relation] ?? relation.toLowerCase().replaceAll("_", " "));

export function validateDependency(candidate: DependencyEdge, existing: DependencyEdge[]) {
  if (!DEPENDENCY_RELATIONS.includes(candidate.relation as DependencyRelation)) return "Unsupported dependency relation.";
  if (candidate.sourceLimitId === candidate.targetLimitId) return "A Limit cannot depend on itself.";
  if (existing.some((edge) => edge.sourceLimitId === candidate.sourceLimitId && edge.targetLimitId === candidate.targetLimitId && edge.relation === candidate.relation && edge.reviewStatus !== "REJECTED")) return "This dependency already exists.";
  const adjacency = new Map<string, string[]>();
  for (const edge of existing) {
    if (edge.reviewStatus === "REJECTED") continue;
    const targets = adjacency.get(edge.sourceLimitId) ?? [];
    targets.push(edge.targetLimitId);
    adjacency.set(edge.sourceLimitId, targets);
  }
  const pending = [candidate.targetLimitId];
  const visited = new Set<string>();
  while (pending.length) {
    const node = pending.pop()!;
    if (node === candidate.sourceLimitId) return "This direction would create a dependency cycle.";
    if (visited.has(node)) continue;
    visited.add(node);
    pending.push(...(adjacency.get(node) ?? []));
  }
  return null;
}
