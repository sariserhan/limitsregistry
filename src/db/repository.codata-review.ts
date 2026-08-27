import "server-only";
import { and, countDistinct, eq, inArray, like } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, claimEvidence, claims, limits, reviews, specificationVersions, timelineEvents, user } from "./schema";

const CODATA_PATTERN = "LR-001%";
const EXPECTED_CODATA_RECORDS = 200;

export async function getCodataReviewSummary(currentUserId?: string) {
  const records = await db.select({ claimId: claims.id, claimStatus: claims.status, limitStatus: limits.status }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(like(limits.registryNumber, CODATA_PATTERN));
  const reviewerRows = await db.select({ reviewerUserId: reviews.reviewerUserId, name: user.name, reviewedClaims: countDistinct(reviews.claimId) }).from(reviews).innerJoin(user, eq(user.id, reviews.reviewerUserId)).innerJoin(claims, eq(claims.id, reviews.claimId)).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(and(like(limits.registryNumber, CODATA_PATTERN), eq(reviews.decision, "ACCEPTED"))).groupBy(reviews.reviewerUserId, user.name);
  return {
    total: records.length,
    acceptedClaims: records.filter((row) => row.claimStatus === "ACCEPTED").length,
    underReviewClaims: records.filter((row) => row.claimStatus === "UNDER_REVIEW").length,
    publishedLimits: records.filter((row) => row.limitStatus === "PROVEN").length,
    currentUserReviewed: currentUserId ? reviewerRows.find((row) => row.reviewerUserId === currentUserId)?.reviewedClaims ?? 0 : 0,
    reviewers: reviewerRows.map(({ reviewerUserId, name, reviewedClaims }) => ({ reviewerUserId, name, reviewedClaims })),
  };
}

export async function recordCodataBatchReview(input: { reviewerUserId: string; rationale: string }) {
  const rationale = input.rationale.trim();
  if (rationale.length < 30) throw new Error("Review rationale must contain at least 30 characters.");
  return db.transaction(async (tx) => {
    const records = await tx.select({ claim: claims, limit: limits }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(like(limits.registryNumber, CODATA_PATTERN));
    if (records.length !== EXPECTED_CODATA_RECORDS) throw new Error(`Expected ${EXPECTED_CODATA_RECORDS} CODATA records, found ${records.length}.`);
    const inserted = await tx.insert(reviews).values(records.map(({ claim }) => ({ claimId: claim.id, reviewerUserId: input.reviewerUserId, decision: "ACCEPTED", rationale, conflictDisclosed: false }))).onConflictDoNothing({ target: [reviews.claimId, reviews.reviewerUserId] }).returning({ claimId: reviews.claimId });
    if (inserted.length !== EXPECTED_CODATA_RECORDS) throw new Error("This reviewer has already reviewed part or all of the CODATA batch.");
    const now = new Date();
    await tx.update(claims).set({ status: "UNDER_REVIEW", updatedAt: now }).where(and(inArray(claims.id, records.map(({ claim }) => claim.id)), eq(claims.status, "DRAFT")));
    await tx.insert(auditLogs).values(records.map(({ claim }) => ({ actorUserId: input.reviewerUserId, action: "CODATA_REVIEW_ACCEPTED", entityType: "CLAIM", entityId: claim.id, before: { status: claim.status }, after: { reviewDecision: "ACCEPTED", claimStatus: claim.status === "DRAFT" ? "UNDER_REVIEW" : claim.status }, reason: rationale })));
    return { reviewed: inserted.length };
  });
}

export async function publishReviewedCodataBatch(input: { actorUserId: string; rationale: string }) {
  const rationale = input.rationale.trim();
  if (rationale.length < 30) throw new Error("Publication rationale must contain at least 30 characters.");
  return db.transaction(async (tx) => {
    const records = await tx.select({ claim: claims, limit: limits }).from(claims).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, eq(limits.id, specificationVersions.limitId)).where(like(limits.registryNumber, CODATA_PATTERN));
    if (records.length !== EXPECTED_CODATA_RECORDS) throw new Error(`Expected ${EXPECTED_CODATA_RECORDS} CODATA records, found ${records.length}.`);
    if (records.every(({ claim, limit }) => claim.status === "ACCEPTED" && limit.status === "PROVEN")) return { published: 0, alreadyPublished: true };
    const claimIds = records.map(({ claim }) => claim.id);
    const acceptedReviewCounts = await tx.select({ claimId: reviews.claimId, reviewers: countDistinct(reviews.reviewerUserId) }).from(reviews).where(and(inArray(reviews.claimId, claimIds), eq(reviews.decision, "ACCEPTED"))).groupBy(reviews.claimId);
    const reviewMap = new Map(acceptedReviewCounts.map((row) => [row.claimId, row.reviewers]));
    const evidenceRows = await tx.select({ claimId: claimEvidence.claimId }).from(claimEvidence).where(inArray(claimEvidence.claimId, claimIds)).groupBy(claimEvidence.claimId);
    const evidenceSet = new Set(evidenceRows.map((row) => row.claimId));
    const unready = records.filter(({ claim }) => (reviewMap.get(claim.id) ?? 0) < 2 || !evidenceSet.has(claim.id));
    if (unready.length) throw new Error(`${unready.length} Claims lack two independent accepted reviews or attached evidence.`);
    const now = new Date();
    await tx.update(claims).set({ status: "ACCEPTED", updatedAt: now }).where(inArray(claims.id, claimIds));
    const limitIds = records.map(({ limit }) => limit.id);
    await tx.update(limits).set({ status: "PROVEN", publishedAt: now, updatedAt: now }).where(inArray(limits.id, limitIds));
    await tx.insert(timelineEvents).values(records.map(({ claim, limit }) => ({ limitId: limit.id, claimId: claim.id, eventType: "REGISTRY_PUBLICATION", title: "Published after two independent Registry reviews", description: rationale, occurredAt: now, metadata: { batch: "CODATA_2022", acceptedReviewCount: reviewMap.get(claim.id) } })));
    await tx.insert(auditLogs).values(records.flatMap(({ claim, limit }) => [
      { actorUserId: input.actorUserId, action: "CLAIM_STATUS_ACCEPTED", entityType: "CLAIM", entityId: claim.id, before: { status: claim.status }, after: { status: "ACCEPTED" }, reason: rationale },
      { actorUserId: input.actorUserId, action: "LIMIT_STATUS_PROVEN", entityType: "LIMIT", entityId: limit.id, before: { status: limit.status }, after: { status: "PROVEN", publishedAt: now.toISOString() }, reason: rationale },
    ]));
    return { published: records.length, alreadyPublished: false };
  });
}
