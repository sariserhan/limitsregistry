import "server-only";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, claimEvidence, claims, evidence, limits, reviews, specificationVersions } from "./schema";


export async function getRegistryQualityReport() {
  const publicWhere = sql`l.status in ('OPEN', 'PROVEN', 'DISPUTED', 'RETIRED')`;
  const [[summary], [metadata], [specifications], [claimsReport], [evidenceReport], [duplicates]] = await Promise.all([
    db.execute<{ total: number; public_total: number }>(sql`select count(*)::int as total, count(*) filter (where ${publicWhere})::int as public_total from limits l`),
    db.execute<{ missing_subcategory: number; missing_unit: number; missing_summary: number }>(sql`select count(*) filter (where l.subcategory is null or trim(l.subcategory) = '')::int as missing_subcategory, count(*) filter (where l.unit is null or trim(l.unit) = '')::int as missing_unit, count(*) filter (where l.summary is null or trim(l.summary) = '')::int as missing_summary from limits l where ${publicWhere}`),
    db.execute<{ without_specification: number }>(sql`select count(*)::int as without_specification from limits l where ${publicWhere} and not exists (select 1 from limit_spec_versions s where s.limit_id = l.id)`),
    db.execute<{ without_accepted_claim: number }>(sql`select count(*)::int as without_accepted_claim from limits l where ${publicWhere} and not exists (select 1 from limit_spec_versions s join claims c on c.specification_version_id = s.id where s.limit_id = l.id and c.status = 'ACCEPTED')`),
    db.execute<{ without_evidence: number }>(sql`select count(*)::int as without_evidence from limits l where ${publicWhere} and not exists (select 1 from evidence e where e.limit_id = l.id) and not exists (select 1 from limit_spec_versions s join claims c on c.specification_version_id = s.id join claim_evidence ce on ce.claim_id = c.id where s.limit_id = l.id)`),
    db.execute<{ duplicate_title_groups: number }>(sql`select count(*)::int as duplicate_title_groups from (select lower(regexp_replace(trim(title), '[^a-z0-9]+', '', 'gi')) as normalized_title from limits group by 1 having count(*) > 1) d`),
  ]);
  return { ...summary, ...metadata, ...specifications, ...claimsReport, ...evidenceReport, ...duplicates };
}

export async function listDuplicateLimitCandidates() {
  const rows = await db.execute<{ normalized_title: string; category: string; records: Array<{ id: string; registryNumber: string; title: string; status: string; summary: string }> }>(sql`select lower(regexp_replace(trim(title), '[^a-z0-9]+', '', 'gi')) as normalized_title, min(category) as category, jsonb_agg(jsonb_build_object('id', id, 'registryNumber', registry_number, 'title', title, 'status', status, 'summary', summary) order by registry_number) as records from limits group by lower(regexp_replace(trim(title), '[^a-z0-9]+', '', 'gi')), category having count(*) > 1 order by normalized_title`);
  return rows;
}

export async function retireDuplicateLimit(input: { duplicateId: string; keptId: string; actorUserId: string; rationale: string }) {
  if (input.duplicateId === input.keptId) throw new Error("The duplicate and kept records must be different.");
  const rationale = input.rationale.trim();
  if (rationale.length < 20) throw new Error("Provide at least 20 characters explaining why these records are duplicates.");
  return db.transaction(async (tx) => {
    const records = await tx.select({ id: limits.id, registryNumber: limits.registryNumber, status: limits.status }).from(limits).where(inArray(limits.id, [input.duplicateId, input.keptId]));
    const duplicate = records.find((row) => row.id === input.duplicateId);
    const kept = records.find((row) => row.id === input.keptId);
    if (!duplicate || !kept) throw new Error("Both records must exist.");
    if (duplicate.status === "RETIRED") return duplicate;
    const [updated] = await tx.update(limits).set({ status: "RETIRED", updatedAt: new Date() }).where(eq(limits.id, duplicate.id)).returning();
    await tx.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "DUPLICATE_LIMIT_RETIRED", entityType: "LIMIT", entityId: duplicate.id, before: duplicate, after: { ...updated, keptRecord: kept.registryNumber }, reason: rationale });
    return updated;
  });
}

export async function getLimitConfidence(limitId: string) {
  const [[claimSummary], [evidenceSummary], [reviewSummary]] = await Promise.all([
    db.select({ accepted: sql<number>`count(*)::int` }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).where(and(eq(specificationVersions.limitId, limitId), eq(claims.status, "ACCEPTED"))),
    db.select({ count: sql<number>`count(distinct evidence.id)::int` }).from(evidence).leftJoin(claimEvidence, eq(claimEvidence.evidenceId, evidence.id)).leftJoin(claims, eq(claims.id, claimEvidence.claimId)).leftJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).where(or(eq(evidence.limitId, limitId), eq(specificationVersions.limitId, limitId))),
    db.select({ count: sql<number>`count(distinct ${reviews.id})::int` }).from(reviews).innerJoin(claims, eq(claims.id, reviews.claimId)).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).where(and(eq(specificationVersions.limitId, limitId), eq(reviews.decision, "ACCEPTED"))),
  ]);
  const claimScore = Math.min(claimSummary.accepted, 3) / 3;
  const evidenceScore = Math.min(evidenceSummary.count, 3) / 3;
  const reviewScore = Math.min(reviewSummary.count, 2) / 2;
  const score = Math.round((claimScore * 0.35 + evidenceScore * 0.3 + reviewScore * 0.35) * 100);
  return { score, acceptedClaims: claimSummary.accepted, evidence: evidenceSummary.count, acceptedReviews: reviewSummary.count };
}

export async function listLimitAuditHistory(limitId: string) {
  return db.select({ id: auditLogs.id, action: auditLogs.action, before: auditLogs.before, after: auditLogs.after, reason: auditLogs.reason, createdAt: auditLogs.createdAt }).from(auditLogs).where(and(eq(auditLogs.entityType, "LIMIT"), eq(auditLogs.entityId, limitId))).orderBy(desc(auditLogs.createdAt)).limit(50);
}
