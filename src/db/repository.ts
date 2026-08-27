import { unstable_cache } from "next/cache";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { claimEvidence, claims, evidence, follows, limits, notifications, specificationVersions, reviews, auditLogs, certificates, watchlistEvents } from "./schema";
import { shouldPublishAcceptedClaimEvent } from "../watchlists/events";
import { serializeClaim, serializeEvidence, serializeLimit, serializeSpecification } from "./serializers";

export const listPublishedLimits = unstable_cache(async () => db.select().from(limits).where(inArray(limits.status, ["OPEN", "PROVEN"])).orderBy(asc(limits.registryNumber)), ["published-limits"], { revalidate: 60, tags: ["published-limits"] });
export async function getPublishedLimit(registryNumber: string) { const read = unstable_cache(async () => { const rows = await db.select().from(limits).where(and(inArray(limits.status, ["OPEN", "PROVEN"]), eq(limits.registryNumber, registryNumber))).limit(1); return rows[0] ?? null; }, ["published-limit", registryNumber], { revalidate: 60, tags: ["published-limits", `published-limit-${registryNumber}`] }); return read(); }
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
  const read = unstable_cache(async () => {
    const specs = await db.select().from(specificationVersions).where(eq(specificationVersions.limitId, limitId)).orderBy(sql`${specificationVersions.versionNumber} desc`);
    const spec = specs[0];
    if (!spec) return { specification: null, claims: [], evidence: [] };
    const rows = await db.select({ claim: claims, evidence }).from(claims).leftJoin(claimEvidence, eq(claimEvidence.claimId, claims.id)).leftJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(eq(claims.specificationVersionId, spec.id)).orderBy(asc(claims.createdAt));
    return { specification: serializeSpecification(spec), claims: rows.map(({ claim }) => serializeClaim(claim)), evidence: rows.flatMap(({ evidence: item }) => item ? [serializeEvidence(item)] : []) };
  }, ["limit-research", limitId], { revalidate: 60, tags: [`limit-research-${limitId}`] });
  return read();
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
export async function updateClaimEditorialStatus(claimId: string, status: "ACCEPTED" | "REJECTED" | "UNDER_REVIEW" | "DISPUTED" | "INVALIDATED", actorUserId?: string) {
  return db.transaction(async (tx) => {
    const records = await tx.select({ claim: claims, limit: limits }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(eq(claims.id, claimId)).limit(1);
    const record = records[0]; if (!record) return null;
    const [row] = await tx.update(claims).set({ status, updatedAt: new Date() }).where(eq(claims.id, claimId)).returning();
    if (shouldPublishAcceptedClaimEvent(record.claim.status, status, record.limit.status)) {
      const payload = { claimId: row.id, claimNumber: row.claimNumber, registryNumber: record.limit.registryNumber, title: ` accepted`, summary: ` `, url: `/limits/` };
      const [event] = await tx.insert(watchlistEvents).values({ limitId: record.limit.id, eventType: "CLAIM_ACCEPTED", sourceEntityType: "CLAIM", sourceEntityId: row.id, payload, publishedAt: new Date() }).onConflictDoNothing().returning();
      if (event) { const subscribers = await tx.select().from(follows).where(and(eq(follows.limitId, record.limit.id), eq(follows.enabled, true))); if (subscribers.length) await tx.insert(notifications).values(subscribers.map((follow) => ({ followId: follow.id, watchlistEventId: event.id, eventType: event.eventType, payload }))).onConflictDoNothing(); }
    }
    if (actorUserId) await tx.insert(auditLogs).values({ actorUserId, action: `CLAIM_STATUS_`, entityType: "CLAIM", entityId: claimId, before: record.claim, after: row });
    return row;
  });
}

export async function createEditorialClaim(input: { claimNumber: string; specificationVersionId: string; claimType: "UPPER_BOUND" | "LOWER_BOUND" | "EXACT_VALUE" | "CONSTRUCTION" | "COUNTEREXAMPLE" | "ASYMPTOTIC_BOUND" | "COMPUTATIONAL_BOUND"; relation: "<" | "<=" | "=" | ">=" | ">"; valueExact: string; epistemicStatus: "LITERATURE_ASSERTED" | "SOURCE_CONFIRMED" | "REPRODUCED" | "PROVEN" | "FORMALLY_PROVEN" | "EMPIRICALLY_SUPPORTED" | "DISPUTED" | "INVALIDATED"; methodSummary?: string }) { const [row] = await db.insert(claims).values({ ...input, scopeParameters: {}, status: "DRAFT" }).returning(); return row; }
export async function createEditorialEvidence(input: { type: "PAPER" | "FORMAL_PROOF" | "SOURCE_CODE" | "DATASET" | "EXHAUSTIVE_COMPUTATION" | "EXPERIMENT" | "REPRODUCTION" | "OTHER"; label: string; url?: string; location?: string }) { const [row] = await db.insert(evidence).values({ ...input, metadata: {} }).returning(); return row; }
export async function recordEditorialReview(input: { claimId: string; reviewerUserId: string; decision: string; rationale: string; conflictDisclosed: boolean }) { const [row] = await db.insert(reviews).values(input).returning(); return row; }
export async function listAuditLog() { return db.select().from(auditLogs).orderBy(sql`${auditLogs.createdAt} desc`).limit(50); }


export async function issueClaimCertificate(input: { claimId: string; certificateType: "CLAIM_ACCEPTED" | "RECORD_ESTABLISHED"; issuedByUserId?: string }) {
  const rows = await db.select({ claim: claims, spec: specificationVersions, limit: limits }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(eq(claims.id, input.claimId)).limit(1);
  const record = rows[0]; if (!record || record.claim.status !== "ACCEPTED") throw new Error("Only accepted Claims can receive certificates.");
  const evidenceRows = await db.select({ id: claimEvidence.evidenceId }).from(claimEvidence).where(eq(claimEvidence.claimId, input.claimId));
  const reviewRows = await db.select({ id: reviews.id }).from(reviews).where(and(eq(reviews.claimId, input.claimId), eq(reviews.decision, "ACCEPTED")));
  if (evidenceRows.length === 0 || reviewRows.length < 2) throw new Error("A certificate requires evidence and two accepted independent reviews.");
  const snapshot = { certificateType: input.certificateType, claimNumber: record.claim.claimNumber, claimType: record.claim.claimType, relation: record.claim.relation, valueExact: record.claim.valueExact, specificationVersionId: record.spec.id, specificationVersion: record.spec.versionNumber, registryNumber: record.limit.registryNumber, evidenceIds: evidenceRows.map((item) => item.id).sort(), acceptedReviewCount: reviewRows.length };
  const { hashCertificateSnapshot, signCertificateHash } = await import("../certificates/hash"); const recordHash = hashCertificateSnapshot(snapshot); const signed = signCertificateHash(recordHash); const [certificate] = await db.insert(certificates).values({ certificateNumber: `CERT-${record.claim.claimNumber}`, certificateType: input.certificateType, claimId: input.claimId, recordHash, signature: signed.signature, signatureAlgorithm: signed.algorithm, snapshot, issuedByUserId: input.issuedByUserId }).returning(); return certificate;
}


export async function getCertificate(certificateNumber: string) { const rows = await db.select().from(certificates).where(eq(certificates.certificateNumber, certificateNumber)).limit(1); return rows[0] ?? null; }
