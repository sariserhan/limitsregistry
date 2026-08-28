import { unstable_cache } from "next/cache";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { claimEvidence, claims, evidence, follows, limits, notifications, specificationVersions, reviews, auditLogs, certificates, watchlistEvents, timelineEvents } from "./schema";
import { shouldPublishAcceptedClaimEvent } from "../watchlists/events";
import { serializeClaim, serializeEvidence, serializeLimit, serializeSpecification } from "./serializers";
import { deriveFrontier } from "../domain/frontier";
import { detectAndRecordBreakthroughs } from "./repository.breakthroughs";

export const listPublishedLimits = unstable_cache(async () => db.select().from(limits).where(inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"])).orderBy(asc(limits.registryNumber)), ["published-limits"], { revalidate: 60, tags: ["published-limits"] });
export async function getPublishedLimit(registryNumber: string) { const read = unstable_cache(async () => { const rows = await db.select().from(limits).where(and(inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"]), eq(limits.registryNumber, registryNumber))).limit(1); return rows[0] ?? null; }, ["published-limit", registryNumber], { revalidate: 60, tags: ["published-limits", `published-limit-${registryNumber}`] }); return read(); }
export async function getLimitClaims(limitId: string) { const specs = await db.select({ id: specificationVersions.id }).from(specificationVersions).where(eq(specificationVersions.limitId, limitId)); if (specs.length === 0) return []; return db.select({ claim: claims, evidence: evidence }).from(claims).innerJoin(claimEvidence, eq(claimEvidence.claimId, claims.id)).innerJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(eq(claims.specificationVersionId, specs[0].id)).orderBy(asc(claims.createdAt)); }
export async function getDatabaseHealth() { const result = await db.execute<{ ok: number }>(sql`select 1 as ok`); return result[0]?.ok === 1; }
export const getRegistryStats = unstable_cache(async () => {
  const [[{ n: limitCount }], [{ n: evidenceCount }], [{ n: categoryCount }], [{ n: sourceCount }]] = await Promise.all([
    db.execute<{ n: number }>(sql`select count(*)::int as n from limits where status in ('OPEN','PROVEN','DISPUTED','RETIRED')`),
    db.execute<{ n: number }>(sql`select count(*)::int as n from evidence`),
    db.execute<{ n: number }>(sql`select count(distinct category)::int as n from limits where status in ('OPEN','PROVEN','DISPUTED','RETIRED')`),
    db.execute<{ n: number }>(sql`select count(distinct url)::int as n from evidence where url is not null`),
  ]);
  return { limitCount, evidenceCount, categoryCount, sourceCount };
}, ["registry-stats"], { revalidate: 300, tags: ["registry-stats"] });
export async function getSpecificationVersionHistory(limitId: string) {
  return db.select({ id: specificationVersions.id, version: specificationVersions.versionNumber, createdAt: specificationVersions.createdAt }).from(specificationVersions).where(eq(specificationVersions.limitId, limitId)).orderBy(asc(specificationVersions.versionNumber));
}


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
    // evidence.limitId is a general citation not tied to any specific claim — the only way an OPEN
    // record with no accepted claim yet (e.g. an unfactored RSA challenge number) still has a real,
    // visible source instead of one that exists in the DB but is unreachable through the claim join.
    const directEvidence = await db.select().from(evidence).where(eq(evidence.limitId, limitId));
    const evidenceById = new Map<string, ReturnType<typeof serializeEvidence>>();
    for (const item of directEvidence) evidenceById.set(item.id, serializeEvidence(item));
    if (!spec) return { specification: null, claimRows: [], evidence: [...evidenceById.values()], claimEvidenceIds: {} as Record<string, string[]> };
    const rows = await db.select({ claim: claims, evidence }).from(claims).leftJoin(claimEvidence, eq(claimEvidence.claimId, claims.id)).leftJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(eq(claims.specificationVersionId, spec.id)).orderBy(asc(claims.createdAt));
    const claimEvidenceIds: Record<string, string[]> = {};
    for (const row of rows) { if (!row.evidence) continue; evidenceById.set(row.evidence.id, serializeEvidence(row.evidence)); (claimEvidenceIds[row.claim.id] ??= []).push(row.evidence.id); }
    // Claim rows are kept raw here (not run through serializeClaim) — parseExact() can produce a
    // BigInt for integer-valued claims, and unstable_cache JSON-serializes its return value to store
    // it; BigInt isn't JSON-serializable and throws "Do not know how to serialize a BigInt" before the
    // cache write even completes. BigInt conversion happens after the cache boundary instead, below.
    return { specification: serializeSpecification(spec), claimRows: rows.map(({ claim }) => claim), evidence: [...evidenceById.values()], claimEvidenceIds };
  }, ["limit-research", limitId], { revalidate: 60, tags: [`limit-research-${limitId}`] });
  const { specification, claimRows, evidence: evidenceList, claimEvidenceIds } = await read();
  // createdAt round-trips through unstable_cache's JSON cache as a string despite its Date type.
  const claimsData = claimRows.map((row) => serializeClaim({ ...row, createdAt: new Date(row.createdAt) }, undefined, claimEvidenceIds[row.id] ?? []));
  return { specification, claims: claimsData, evidence: evidenceList };
}

// getPublishedDomainLimit's serialized shape overwrites `.id` with the registry number
// (serializeLimit maps id: row.registryNumber) — passing that into getLimitResearchData(limitId)
// compares a uuid column against a registry-number string and silently returns no specification.
// This uses the raw row (real DB uuid still on `.id`) so the frontier is actually computed.
export async function getPublishedLimitWithFrontier(registryNumber: string) {
  const limit = await getPublishedLimit(registryNumber);
  if (!limit) return null;
  const { specification, claims: claimsData } = await getLimitResearchData(limit.id);
  const frontier = specification ? deriveFrontier(limit.direction, specification, claimsData) : null;
  return { limit, specification, claims: claimsData, frontier };
}

export async function searchPublishedLimits(query: string, resultLimit = 10) {
  const pattern = `%${query}%`;
  return db.select().from(limits).where(and(inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"]), sql`(${limits.title} ilike ${pattern} or ${limits.category} ilike ${pattern} or ${limits.summary} ilike ${pattern})`)).limit(resultLimit);
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
// Only a genuine transition INTO accepted can generate events — re-saving an already-ACCEPTED
// claim as ACCEPTED again (or accepting a claim on a still-DRAFT, unpublished Limit) must not
// fire notifications or a breakthrough a second time.
export async function updateClaimEditorialStatus(claimId: string, status: "ACCEPTED" | "REJECTED" | "UNDER_REVIEW" | "DISPUTED" | "INVALIDATED", actorUserId: string) {
  const result = await db.transaction(async (tx) => {
    const records = await tx.select({ claim: claims, limit: limits }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(eq(claims.id, claimId)).limit(1);
    const record = records[0];
    if (!record) return null;
    const [row] = await tx.update(claims).set({ status, updatedAt: new Date() }).where(eq(claims.id, claimId)).returning();
    const isNewAcceptance = shouldPublishAcceptedClaimEvent(record.claim.status, status, record.limit.status);
    if (isNewAcceptance) {
      const payload = { claimId: row.id, claimNumber: row.claimNumber, registryNumber: record.limit.registryNumber, title: `${row.claimNumber} accepted`, summary: `${row.relation} ${row.valueExact}`, url: `/limits/${record.limit.registryNumber}` };
      const [event] = await tx.insert(watchlistEvents).values({ limitId: record.limit.id, eventType: "CLAIM_ACCEPTED", sourceEntityType: "CLAIM", sourceEntityId: row.id, payload, publishedAt: new Date() }).onConflictDoNothing().returning();
      if (event) {
        const subscribers = await tx.select().from(follows).where(and(eq(follows.limitId, record.limit.id), eq(follows.enabled, true)));
        if (subscribers.length) await tx.insert(notifications).values(subscribers.map((follow) => ({ followId: follow.id, watchlistEventId: event.id, eventType: event.eventType, payload }))).onConflictDoNothing();
      }
    }
    await tx.insert(auditLogs).values({ actorUserId, action: `CLAIM_STATUS_${status}`, entityType: "CLAIM", entityId: claimId, before: record.claim, after: row });
    return { row, isNewAcceptance };
  });
  if (!result) return null;
  // Runs AFTER the transaction above commits, not inside it — detectAndRecordBreakthroughs
  // re-reads the claim's status on its own connection, so calling it from inside the still-open
  // tx would see the pre-update status (READ COMMITTED can't see this transaction's own
  // uncommitted write from a separate connection) and silently skip every breakthrough.
  if (result.isNewAcceptance) await detectAndRecordBreakthroughs(result.row.id, actorUserId);
  return result.row;
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

/** One cached read for the public Browse surface; prevents database records from inheriting launch-fixture frontiers. */
export async function listPublishedLimitsWithFrontiers() {
  const publicStatuses: Array<"OPEN" | "PROVEN" | "DISPUTED" | "RETIRED"> = ["OPEN", "PROVEN", "DISPUTED", "RETIRED"];
  const [rows, events] = await Promise.all([
    db.select({ limit: limits, specification: specificationVersions, claim: claims }).from(limits).innerJoin(specificationVersions, eq(specificationVersions.limitId, limits.id)).leftJoin(claims, eq(claims.specificationVersionId, specificationVersions.id)).where(inArray(limits.status, publicStatuses)).orderBy(asc(limits.registryNumber), sql`${specificationVersions.versionNumber} desc`),
    db.select({ limitId: timelineEvents.limitId, id: timelineEvents.id, eventType: timelineEvents.eventType, title: timelineEvents.title, description: timelineEvents.description, occurredAt: timelineEvents.occurredAt }).from(timelineEvents).innerJoin(limits, eq(limits.id, timelineEvents.limitId)).where(inArray(limits.status, publicStatuses)).orderBy(sql`${timelineEvents.occurredAt} desc`),
  ]);
  const eventsByLimit = new Map<string, typeof events>();
  for (const event of events) eventsByLimit.set(event.limitId, [...(eventsByLimit.get(event.limitId) ?? []), event]);
  const grouped = new Map<string, { limit: typeof limits.$inferSelect; specification: typeof specificationVersions.$inferSelect; claimRows: Array<typeof claims.$inferSelect> }>();
  for (const row of rows) {
    const current = grouped.get(row.limit.id);
    if (!current) grouped.set(row.limit.id, { limit: row.limit, specification: row.specification, claimRows: row.claim ? [row.claim] : [] });
    else if (current.specification.id === row.specification.id && row.claim) current.claimRows.push(row.claim);
  }
  return [...grouped.values()].map(({ limit, specification, claimRows }) => {
    const serializedSpecification = serializeSpecification(specification);
    const serializedClaims = claimRows.filter((claim) => claim.status === "ACCEPTED").map((claim) => serializeClaim(claim));
    return { limit, specification: serializedSpecification, claims: serializedClaims, timeline: eventsByLimit.get(limit.id) ?? [], frontier: deriveFrontier(limit.direction, serializedSpecification, serializedClaims) };
  });
}
