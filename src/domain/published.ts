import { deriveFrontier, type Frontier } from "./frontier";
import { browseLimits, type BrowseLimit } from "./registry";
import type { Claim, ExactValue, SpecificationVersion } from "./types";

export type PublishedLimit = BrowseLimit & { publishedAt?: string; specification: SpecificationVersion; claimsData: Claim[]; frontier: Frontier };

const numeric = (value: string): bigint | null => /^\d+$/.test(value) ? BigInt(value) : null;

function makePublished(limit: BrowseLimit): PublishedLimit {
  const specification: SpecificationVersion = { id: `SP-${limit.id}`, limitId: limit.id, version: 2, formalStatement: limit.summary, constraints: { category: limit.category }, asymptotic: limit.gap === "Asymptotic", probabilistic: false };
  const claimsData: Claim[] = [];
  const achievable = numeric(limit.achievable);
  const bound = numeric(limit.bound);
  if (achievable !== null) claimsData.push({ id: `CLM-${limit.id}-A`, specificationVersionId: specification.id, claimType: "CONSTRUCTION", relation: ">=", value: { kind: "integer", value: achievable }, status: "ACCEPTED", epistemicStatus: "SOURCE_CONFIRMED", evidenceIds: [], author: "Registry source", year: 2025, source: "Curated launch record" });
  if (bound !== null) claimsData.push({ id: `CLM-${limit.id}-B`, specificationVersionId: specification.id, claimType: "UPPER_BOUND", relation: "<=", value: { kind: "integer", value: bound }, status: "ACCEPTED", epistemicStatus: limit.status === "PROVEN" ? "PROVEN" : "SOURCE_CONFIRMED", evidenceIds: [], author: "Registry source", year: 2025, source: "Curated launch record" });
  const frontier = deriveFrontier(limit.direction, specification, claimsData);
  return { ...limit, status: frontier.status === "PROVEN" ? "PROVEN" : "OPEN", specification, claimsData, frontier };
}

export const publishedLimits = browseLimits.map(makePublished);
export function getPublishedLimit(id: string): PublishedLimit | undefined { return publishedLimits.find((limit) => limit.id === id); }
export function formatExact(value: ExactValue | null): string { if (!value) return "?"; if (value.kind === "integer") return value.value?.toString() ?? "?"; if (value.kind === "rational") return `${value.numerator}/${value.denominator}`; return value.value; }
