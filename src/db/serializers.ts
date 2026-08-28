import type { claims, evidence, limits, specificationVersions } from "./schema";
import type { Claim, Evidence, Limit, SpecificationVersion } from "../domain/types";

type LimitRow = typeof limits.$inferSelect;
type SpecRow = typeof specificationVersions.$inferSelect;
type ClaimRow = typeof claims.$inferSelect;
type EvidenceRow = typeof evidence.$inferSelect;

export function serializeLimit(row: LimitRow): Limit { return { id: row.registryNumber, title: row.title, category: row.category, status: row.status, direction: row.direction, summary: row.summary }; }
export function serializeSpecification(row: SpecRow): SpecificationVersion { const assumptions = Object.fromEntries(Object.entries(row.assumptions).map(([key, value]) => [key, String(value)])); return { id: row.id, limitId: row.limitId, version: row.versionNumber, formalStatement: row.formalStatement, constraints: Object.fromEntries(Object.entries(row.constraints).map(([key, value]) => [key, String(value)])), assumptions, recordKind: assumptions.kind, asymptotic: row.asymptotic, probabilistic: row.probabilistic }; }
export function parseExact(value: string): Claim["value"] {
  const rational = value.match(/^(-?\d+)\/(-?\d+)$/);
  if (rational) return { kind: "rational", numerator: BigInt(rational[1]), denominator: BigInt(rational[2]) };
  if (/^-?\d+$/.test(value)) return { kind: "integer", value: BigInt(value) };
  return { kind: "text", value };
}
export function serializeClaim(row: ClaimRow, author = "Registry contributor", evidenceIds: string[] = []): Claim { return { id: row.claimNumber, specificationVersionId: row.specificationVersionId, claimType: row.claimType, relation: row.relation, value: parseExact(row.valueExact), status: row.status, epistemicStatus: row.epistemicStatus, evidenceIds, methodSummary: row.methodSummary ?? undefined, author, year: row.createdAt.getUTCFullYear(), source: "Registry database" }; }
export function serializeEvidence(row: EvidenceRow): Evidence { return { id: row.id, type: ["PAPER", "FORMAL_PROOF", "SOURCE_CODE", "EXHAUSTIVE_COMPUTATION", "EXPERIMENT", "REPRODUCTION"].includes(row.type) ? row.type as Evidence["type"] : "PAPER", label: row.label, location: row.location ?? undefined, sourceUrl: row.url ?? undefined, abstract: typeof row.metadata?.abstract === "string" ? row.metadata.abstract : undefined }; }
