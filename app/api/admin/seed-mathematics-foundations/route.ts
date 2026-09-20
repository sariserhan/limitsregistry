import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { limits, specificationVersions, claims, evidence, claimEvidence, papers, claimPapers, timelineEvents, auditLogs, reviews, user } from "../../../../src/db/schema";
import { mathematicsFoundationRecords, type MathSource } from "../../../../src/catalog/mathematics-foundations";

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

async function findOrCreatePaper(tx: Tx, source: MathSource) {
  const existing = source.doi
    ? await tx.select({ id: papers.id }).from(papers).where(eq(papers.doi, source.doi)).limit(1)
    : await tx.select({ id: papers.id }).from(papers).where(eq(papers.title, source.title)).limit(1);
  if (existing.length) return existing[0].id;
  const [paper] = await tx.insert(papers).values({ title: source.title, publicationDate: new Date(`${source.date}T00:00:00Z`), venue: source.venue, doi: source.doi ?? null, publisherUrl: source.url }).returning({ id: papers.id });
  return paper.id;
}

// Mirrors scripts/seed-mathematics-foundations.ts (which only runs against the local dev DB via
// DATABASE_URL) so the catalog's Ramsey/kissing/packing/prime-gap records can be published to
// production. Idempotent: skips any registryNumber already published, so re-running after
// extending the catalog only inserts the new entries.
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, "serhan.sari83@gmail.com")).limit(1);
  if (!owner) return NextResponse.json({ error: "Owner account not found." }, { status: 500 });

  let inserted = 0, skipped = 0;
  for (const record of mathematicsFoundationRecords) {
    const existing = await db.select({ id: limits.id }).from(limits).where(eq(limits.registryNumber, record.registryNumber)).limit(1);
    if (existing.length) { skipped++; continue; }
    await db.transaction(async (tx) => {
      const publishedAt = new Date(`${record.source.date}T00:00:00Z`);
      const [limit] = await tx.insert(limits).values({
        registryNumber: record.registryNumber, slug: record.slug, title: record.title, summary: record.summary,
        category: "Mathematics", subcategory: record.subcategory, direction: record.direction, metricName: record.metricName,
        unit: record.unit, status: record.status, publishedAt,
      }).returning({ id: limits.id });
      const [spec] = await tx.insert(specificationVersions).values({
        limitId: limit.id, versionNumber: 1, formalStatement: record.formalStatement, constraints: record.constraints,
        assumptions: { kind: "MATHEMATICAL_THEOREM_OR_OPEN_BOUND", sourceUrl: record.source.url, publicationProcess: "AUTHORITATIVE_MATHEMATICS_IMPORT" },
      }).returning({ id: specificationVersions.id });

      const paperId = await findOrCreatePaper(tx, record.source);
      const claimIds: string[] = [];
      for (let i = 0; i < record.claims.length; i++) {
        const item = record.claims[i];
        const [claim] = await tx.insert(claims).values({
          claimNumber: `CLM-MATH-${record.registryNumber.slice(3)}-${i + 1}`, specificationVersionId: spec.id,
          claimType: item.claimType, relation: item.relation, valueExact: item.value, valueText: item.value, unit: record.unit,
          scopeParameters: { sourceLocation: record.source.location, sourceVersion: record.source.date },
          epistemicStatus: "SOURCE_CONFIRMED", status: "ACCEPTED", methodSummary: item.summary,
        }).returning({ id: claims.id });
        claimIds.push(claim.id);
        const [evidenceRow] = await tx.insert(evidence).values({
          type: "PAPER", label: `${record.source.title} — ${record.title} ${item.relation} ${item.value}`, url: record.source.url,
          location: record.source.location, limitId: limit.id,
          metadata: { doi: record.source.doi ?? null, relation: item.relation, value: item.value, verificationLevel: "SOURCE_CONFIRMED" },
        }).returning({ id: evidence.id });
        await tx.insert(claimEvidence).values({ claimId: claim.id, evidenceId: evidenceRow.id });
        await tx.insert(claimPapers).values({ claimId: claim.id, paperId });
        await tx.insert(reviews).values({ claimId: claim.id, reviewerUserId: owner.id, decision: "ACCEPTED", rationale: `Verified against ${record.source.title}.`, conflictDisclosed: false });
        await tx.insert(auditLogs).values({ action: "AUTHORITATIVE_MATHEMATICS_CLAIM_ACCEPTED", entityType: "CLAIM", entityId: claim.id, actorUserId: owner.id, after: { status: "ACCEPTED", relation: item.relation, value: item.value }, reason: `Verified against ${record.source.title}.` });
      }
      await tx.insert(timelineEvents).values({
        limitId: limit.id, claimId: claimIds[0], eventType: "MATHEMATICAL_RESULT_PUBLISHED",
        title: record.status === "PROVEN" ? "Exact result established" : "Current best interval established",
        description: record.summary, occurredAt: publishedAt, metadata: { publicationState: "PUBLIC", source: record.source.url },
      });
      await tx.insert(auditLogs).values({ action: "AUTHORITATIVE_MATHEMATICS_LIMIT_PUBLISHED", entityType: "LIMIT", entityId: limit.id, actorUserId: owner.id, after: { status: record.status, publishedAt: publishedAt.toISOString() }, reason: `Source-backed publication from ${record.source.venue}.` });
    });
    inserted++;
  }

  return NextResponse.json({ inserted, skipped, total: mathematicsFoundationRecords.length });
}
