import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { limits, specificationVersions, claims, evidence, claimEvidence, papers, claimPapers, timelineEvents, auditLogs, reviews, user } from "../../../../src/db/schema";
import { HUMAN_ANIMAL_RECORDS, CHEETAH_SPEED_UPDATE, type HumanAnimalRecord } from "../../../../src/catalog/human-animal-records";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

async function findOrCreatePaper(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], source: HumanAnimalRecord["source"]) {
  const existing = await tx.select({ id: papers.id }).from(papers).where(eq(papers.publisherUrl, source.url)).limit(1);
  if (existing.length) return existing[0].id;
  const [paper] = await tx.insert(papers).values({ title: source.title, publicationDate: new Date(`${source.date}T00:00:00Z`), publisherUrl: source.url }).returning({ id: papers.id });
  return paper.id;
}

// Publishes a claim + evidence + review + timeline event onto an already-inserted-or-updated
// Limit — shared by the 9 brand-new records and the LR-DRAFT-BIO-18 stub fill-in below.
async function publishClaim(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], input: {
  limitId: string; specVersionId: string; registryNumber: string; title: string;
  value: string; unit: string; methodSummary: string; source: HumanAnimalRecord["source"];
  reviewerId: string;
}) {
  const paperId = await findOrCreatePaper(tx, input.source);
  const claimNumber = `CLM-${input.registryNumber.replace("LR-", "")}`;
  const [claim] = await tx.insert(claims).values({
    claimNumber, specificationVersionId: input.specVersionId, claimType: "CONSTRUCTION", relation: "=",
    valueExact: input.value, valueText: `${input.value} ${input.unit}`, unit: input.unit,
    scopeParameters: { sourceLocation: input.source.location, sourceDate: input.source.date },
    epistemicStatus: "SOURCE_CONFIRMED", status: "ACCEPTED", methodSummary: input.methodSummary,
  }).returning({ id: claims.id });
  const [evidenceRow] = await tx.insert(evidence).values({
    type: "PAPER", label: `${input.source.title} — ${input.title}`, url: input.source.url, location: input.source.location,
    limitId: input.limitId, metadata: { verificationLevel: "SOURCE_CONFIRMED", value: input.value, unit: input.unit },
  }).returning({ id: evidence.id });
  await tx.insert(claimEvidence).values({ claimId: claim.id, evidenceId: evidenceRow.id });
  await tx.insert(claimPapers).values({ claimId: claim.id, paperId });
  await tx.insert(reviews).values({ claimId: claim.id, reviewerUserId: input.reviewerId, decision: "ACCEPTED", rationale: `Verified against ${input.source.title}.`, conflictDisclosed: false });
  await tx.insert(timelineEvents).values({
    limitId: input.limitId, claimId: claim.id, eventType: "SOURCE_RECORD_PUBLISHED", title: `${input.title} record confirmed`,
    description: `${input.value} ${input.unit}, ${input.source.location}.`, occurredAt: new Date(`${input.source.date}T00:00:00Z`),
    metadata: { publicationState: "PUBLIC", source: input.source.url },
  });
  await tx.insert(auditLogs).values([
    { action: "HUMAN_ANIMAL_RECORD_CLAIM_ACCEPTED", entityType: "CLAIM", entityId: claim.id, actorUserId: input.reviewerId, after: { status: "ACCEPTED", value: input.value, unit: input.unit }, reason: `Verified against ${input.source.title}.` },
    { action: "HUMAN_ANIMAL_RECORD_LIMIT_PUBLISHED", entityType: "LIMIT", entityId: input.limitId, actorUserId: input.reviewerId, after: { status: "OPEN" }, reason: `Source-backed publication from ${input.source.title}.` },
  ]);
  return claim.id;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, "serhan.sari83@gmail.com")).limit(1);
  if (!owner) return NextResponse.json({ error: "Owner account not found." }, { status: 500 });

  let inserted = 0, skipped = 0;
  for (const record of HUMAN_ANIMAL_RECORDS) {
    const existing = await db.select({ id: limits.id }).from(limits).where(eq(limits.registryNumber, record.registryNumber)).limit(1);
    if (existing.length) { skipped++; continue; }
    await db.transaction(async (tx) => {
      const [limit] = await tx.insert(limits).values({
        registryNumber: record.registryNumber, slug: record.slug, title: record.title, summary: record.summary,
        category: "Biology", subcategory: record.subcategory, direction: record.direction, metricName: record.metricName,
        unit: record.unit, status: "OPEN", publishedAt: new Date(`${record.source.date}T00:00:00Z`),
      }).returning({ id: limits.id });
      const [spec] = await tx.insert(specificationVersions).values({
        limitId: limit.id, versionNumber: 1, formalStatement: record.formalStatement, constraints: {},
        assumptions: { kind: "OBSERVED_RECORD", recordType: "WORLD_RECORD", sourceUrl: record.source.url, publicationProcess: "HUMAN_ANIMAL_RECORDS_IMPORT" },
      }).returning({ id: specificationVersions.id });
      await publishClaim(tx, { limitId: limit.id, specVersionId: spec.id, registryNumber: record.registryNumber, title: record.title, value: record.value, unit: record.unit, methodSummary: record.methodSummary, source: record.source, reviewerId: owner.id });
    });
    inserted++;
  }

  let cheetahUpdated = false;
  const [cheetah] = await db.select({ id: limits.id }).from(limits).where(eq(limits.registryNumber, CHEETAH_SPEED_UPDATE.registryNumber)).limit(1);
  if (cheetah) {
    const [spec] = await db.select({ id: specificationVersions.id }).from(specificationVersions).where(eq(specificationVersions.limitId, cheetah.id)).limit(1);
    const alreadyClaimed = spec ? await db.select({ id: claims.id }).from(claims).where(eq(claims.specificationVersionId, spec.id)).limit(1) : [];
    if (spec && alreadyClaimed.length === 0) {
      await db.transaction(async (tx) => {
        await tx.update(limits).set({ subcategory: CHEETAH_SPEED_UPDATE.subcategory, direction: CHEETAH_SPEED_UPDATE.direction, metricName: CHEETAH_SPEED_UPDATE.metricName, unit: CHEETAH_SPEED_UPDATE.unit, summary: CHEETAH_SPEED_UPDATE.summary, publishedAt: new Date(`${CHEETAH_SPEED_UPDATE.source.date}T00:00:00Z`), updatedAt: new Date() }).where(eq(limits.id, cheetah.id));
        await tx.update(specificationVersions).set({ formalStatement: CHEETAH_SPEED_UPDATE.formalStatement, assumptions: { kind: "OBSERVED_RECORD", recordType: "WORLD_RECORD", sourceUrl: CHEETAH_SPEED_UPDATE.source.url, publicationProcess: "HUMAN_ANIMAL_RECORDS_IMPORT" }, updatedAt: new Date() }).where(eq(specificationVersions.id, spec.id));
        await publishClaim(tx, { limitId: cheetah.id, specVersionId: spec.id, registryNumber: CHEETAH_SPEED_UPDATE.registryNumber, title: "Cheetah sprint speed", value: CHEETAH_SPEED_UPDATE.value, unit: CHEETAH_SPEED_UPDATE.unit, methodSummary: CHEETAH_SPEED_UPDATE.methodSummary, source: CHEETAH_SPEED_UPDATE.source, reviewerId: owner.id });
      });
      cheetahUpdated = true;
    }
  }

  return NextResponse.json({ inserted, skipped, cheetahUpdated, total: HUMAN_ANIMAL_RECORDS.length });
}
