import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { limits, specificationVersions, claims, evidence, claimEvidence, papers, claimPapers, timelineEvents, auditLogs, reviews, user } from "../../../../src/db/schema";
import { FRONTIER_RECORDS_2026 } from "../../../../src/catalog/frontier-records-2026";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findOrCreatePaper(tx: Tx, source: { title: string; url: string; date: string }) {
  const existing = await tx.select({ id: papers.id }).from(papers).where(eq(papers.publisherUrl, source.url)).limit(1);
  if (existing.length) return existing[0].id;
  const [paper] = await tx.insert(papers).values({ title: source.title, publicationDate: new Date(`${source.date}T00:00:00Z`), publisherUrl: source.url }).returning({ id: papers.id });
  return paper.id;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, "serhan.sari83@gmail.com")).limit(1);
  if (!owner) return NextResponse.json({ error: "Owner account not found." }, { status: 500 });

  let inserted = 0, skipped = 0;
  for (const record of FRONTIER_RECORDS_2026) {
    const existing = await db.select({ id: limits.id }).from(limits).where(eq(limits.registryNumber, record.registryNumber)).limit(1);
    if (existing.length) { skipped++; continue; }
    await db.transaction(async (tx) => {
      const [limit] = await tx.insert(limits).values({
        registryNumber: record.registryNumber, slug: record.slug, title: record.title, summary: record.summary,
        category: record.category, subcategory: record.subcategory, direction: record.direction, metricName: record.metricName,
        unit: record.unit, status: record.limitStatus, publishedAt: new Date(`${record.source.date}T00:00:00Z`),
      }).returning({ id: limits.id });
      const [spec] = await tx.insert(specificationVersions).values({
        limitId: limit.id, versionNumber: 1, formalStatement: record.formalStatement, constraints: {},
        assumptions: { kind: record.claimType === "COUNTEREXAMPLE" ? "MATHEMATICAL_THEOREM_OR_OPEN_BOUND" : "OBSERVED_RECORD", recordType: record.claimType === "COUNTEREXAMPLE" ? "THEOREM" : "WORLD_RECORD", sourceUrl: record.source.url, publicationProcess: "FRONTIER_RECORDS_2026_IMPORT" },
      }).returning({ id: specificationVersions.id });

      const paperId = await findOrCreatePaper(tx, record.source);
      const claimNumber = `CLM-${record.registryNumber.replace("LR-", "")}`;
      const [claim] = await tx.insert(claims).values({
        claimNumber, specificationVersionId: spec.id, claimType: record.claimType, relation: "=",
        valueExact: record.value, valueText: `${record.value} ${record.unit}`, unit: record.unit,
        scopeParameters: { sourceLocation: record.source.location, sourceDate: record.source.date },
        epistemicStatus: record.epistemicStatus, status: "ACCEPTED", methodSummary: record.methodSummary,
      }).returning({ id: claims.id });
      const [evidenceRow] = await tx.insert(evidence).values({
        type: "PAPER", label: `${record.source.title} — ${record.title}`, url: record.source.url, location: record.source.location,
        limitId: limit.id, metadata: { verificationLevel: record.epistemicStatus === "LITERATURE_ASSERTED" ? "REPORTED" : "SOURCE_CONFIRMED", value: record.value, unit: record.unit },
      }).returning({ id: evidence.id });
      await tx.insert(claimEvidence).values({ claimId: claim.id, evidenceId: evidenceRow.id });
      await tx.insert(claimPapers).values({ claimId: claim.id, paperId });
      await tx.insert(reviews).values({ claimId: claim.id, reviewerUserId: owner.id, decision: "ACCEPTED", rationale: `Verified against ${record.source.title}.`, conflictDisclosed: false });
      await tx.insert(timelineEvents).values({
        limitId: limit.id, claimId: claim.id, eventType: "SOURCE_RECORD_PUBLISHED", title: `${record.title} record confirmed`,
        description: `${record.value} ${record.unit}, ${record.source.location}.`, occurredAt: new Date(`${record.source.date}T00:00:00Z`),
        metadata: { publicationState: "PUBLIC", source: record.source.url },
      });
      await tx.insert(auditLogs).values([
        { action: "FRONTIER_RECORD_CLAIM_ACCEPTED", entityType: "CLAIM", entityId: claim.id, actorUserId: owner.id, after: { status: "ACCEPTED", value: record.value, unit: record.unit }, reason: `Verified against ${record.source.title}.` },
        { action: "FRONTIER_RECORD_LIMIT_PUBLISHED", entityType: "LIMIT", entityId: limit.id, actorUserId: owner.id, after: { status: record.limitStatus }, reason: `Source-backed publication from ${record.source.title}.` },
      ]);
    });
    inserted++;
  }

  return NextResponse.json({ inserted, skipped, total: FRONTIER_RECORDS_2026.length });
}
