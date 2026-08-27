import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { claimEvidence, claims, evidence, limits, specificationVersions, reviews, auditLogs } from "./schema";
import { serializeClaim, serializeEvidence, serializeLimit, serializeSpecification } from "./serializers";

export async function listPublishedLimits() { return db.select().from(limits).where(inArray(limits.status, ["OPEN", "PROVEN"])).orderBy(asc(limits.registryNumber)); }
export async function getPublishedLimit(registryNumber: string) { const rows = await db.select().from(limits).where(and(inArray(limits.status, ["OPEN", "PROVEN"]), eq(limits.registryNumber, registryNumber))).limit(1); return rows[0] ?? null; }
export async function getLimitClaims(limitId: string) { const specs = await db.select({ id: specificationVersions.id }).from(specificationVersions).where(eq(specificationVersions.limitId, limitId)); if (specs.length === 0) return []; return db.select({ claim: claims, evidence: evidence }).from(claims).innerJoin(claimEvidence, eq(claimEvidence.claimId, claims.id)).innerJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(eq(claims.specificationVersionId, specs[0].id)).orderBy(asc(claims.createdAt)); }
export async function getDatabaseHealth() { const result = await db.execute<{ ok: number }>(sql`select 1 as ok`); return result[0]?.ok === 1; }


export async function listPublishedDomainLimits() {
  const rows = await listPublishedLimits();
  return rows.map(serializeLimit);
}
export async function getPublishedDomainLimit(registryNumber: string) {
  const row = await getPublishedLimit(registryNumber);
  return row ? serializeLimit(row) : null;
}
export async function getLimitResearchData(limitId: string) {
  const specs = await db.select().from(specificationVersions).where(eq(specificationVersions.limitId, limitId)).orderBy(sql`${specificationVersions.versionNumber} desc`);
  const spec = specs[0];
  if (!spec) return { specification: null, claims: [], evidence: [] };
  const rows = await db.select({ claim: claims, evidence }).from(claims).leftJoin(claimEvidence, eq(claimEvidence.claimId, claims.id)).leftJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(eq(claims.specificationVersionId, spec.id)).orderBy(asc(claims.createdAt));
  return { specification: serializeSpecification(spec), claims: rows.map(({ claim }) => serializeClaim(claim)), evidence: rows.flatMap(({ evidence: item }) => item ? [serializeEvidence(item)] : []) };
}
export async function listEditorialQueue(query = "") {
  const pattern = `%${query}%`;
  return db.select().from(claims).where(sql`${claims.status} in ('DRAFT', 'UNDER_REVIEW') and (${claims.claimNumber} ilike ${pattern} or ${claims.valueExact} ilike ${pattern})`).orderBy(asc(claims.createdAt)).limit(50);
}
export async function createEditorialLimit(input: { registryNumber: string; slug: string; title: string; summary: string; category: string; direction: "MINIMIZE" | "MAXIMIZE" }) {
  const [row] = await db.insert(limits).values({ ...input, metricName: "registry metric" }).returning();
  return row;
}
export async function createEditorialSpec(input: { limitId: string; formalStatement: string; constraints: Record<string, unknown>; assumptions?: Record<string, unknown> }) {
  const [row] = await db.insert(specificationVersions).values({ ...input, assumptions: input.assumptions ?? {}, versionNumber: 1 }).returning();
  return row;
}
export async function updateClaimEditorialStatus(claimId: string, status: "ACCEPTED" | "REJECTED" | "UNDER_REVIEW" | "DISPUTED" | "INVALIDATED") {
  const [row] = await db.update(claims).set({ status, updatedAt: new Date() }).where(eq(claims.id, claimId)).returning();
  return row ?? null;
}

export async function createEditorialClaim(input: { claimNumber: string; specificationVersionId: string; claimType: "UPPER_BOUND" | "LOWER_BOUND" | "EXACT_VALUE" | "CONSTRUCTION" | "COUNTEREXAMPLE" | "ASYMPTOTIC_BOUND" | "COMPUTATIONAL_BOUND"; relation: "<" | "<=" | "=" | ">=" | ">"; valueExact: string; epistemicStatus: "LITERATURE_ASSERTED" | "SOURCE_CONFIRMED" | "REPRODUCED" | "PROVEN" | "FORMALLY_PROVEN" | "EMPIRICALLY_SUPPORTED" | "DISPUTED" | "INVALIDATED"; methodSummary?: string }) { const [row] = await db.insert(claims).values({ ...input, scopeParameters: {}, status: "DRAFT" }).returning(); return row; }
export async function createEditorialEvidence(input: { type: "PAPER" | "FORMAL_PROOF" | "SOURCE_CODE" | "DATASET" | "EXHAUSTIVE_COMPUTATION" | "EXPERIMENT" | "REPRODUCTION" | "OTHER"; label: string; url?: string; location?: string }) { const [row] = await db.insert(evidence).values({ ...input, metadata: {} }).returning(); return row; }
export async function recordEditorialReview(input: { claimId: string; reviewerUserId: string; decision: string; rationale: string; conflictDisclosed: boolean }) { const [row] = await db.insert(reviews).values(input).returning(); return row; }
export async function listAuditLog() { return db.select().from(auditLogs).orderBy(sql`${auditLogs.createdAt} desc`).limit(50); }
