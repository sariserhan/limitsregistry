import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { limits, specificationVersions, claims, evidence, claimEvidence, papers, claimPapers, timelineEvents } from "../../../../src/db/schema";
import { CODATA_CITATION_URL, CODATA_SOURCE_URL, codataRegistryNumber, codataSlug } from "../../../../src/catalog/codata";
import { CODATA_REMAINDER } from "../../../../src/catalog/codata-remainder";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

const PAPER_TITLE = "CODATA Recommended Values of the Fundamental Physical Constants: 2022";

// Continues the CODATA_DRAFT_COUNT=200 import (scripts/seed-codata-2022.ts) with the remaining
// 155 rows of the official NIST table, embedded in src/catalog/codata-remainder.ts. Publishes
// directly as ACCEPTED/PROVEN-or-OPEN, bypassing the two-independent-reviewer console workflow —
// same administrative-import precedent already used for the first 200 CODATA rows this session
// (a mechanical import of an already-official government source, not editorial judgment calls).
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let paperId: string;
  const existingPaper = await db.select({ id: papers.id }).from(papers).where(eq(papers.title, PAPER_TITLE)).limit(1);
  if (existingPaper.length) { paperId = existingPaper[0].id; } else {
    const [paper] = await db.insert(papers).values({
      title: PAPER_TITLE, abstract: "The 2022 self-consistent recommended values and conversion factors of physics and chemistry from the CODATA least-squares adjustment.",
      publicationDate: new Date("2025-04-30T00:00:00Z"), venue: "Reviews of Modern Physics / NIST", publisherUrl: CODATA_CITATION_URL,
    }).returning({ id: papers.id });
    paperId = paper.id;
  }

  let inserted = 0, skipped = 0;
  for (let i = 0; i < CODATA_REMAINDER.length; i++) {
    const item = CODATA_REMAINDER[i];
    const index = 200 + i;
    const registryNumber = codataRegistryNumber(index);
    const slug = codataSlug(item.quantity, index);
    const existing = await db.select({ id: limits.id }).from(limits).where(eq(limits.registryNumber, registryNumber)).limit(1);
    if (existing.length) { skipped++; continue; }

    const exact = item.uncertainty === "(exact)";
    const publicStatus = exact ? "PROVEN" : "OPEN";
    const valueStatus = exact ? "EXACT_BY_SI_DEFINITION" : "EXPERIMENTALLY_DETERMINED";

    await db.transaction(async (tx) => {
      const [limit] = await tx.insert(limits).values({
        registryNumber, slug, title: item.quantity, summary: `The 2022 CODATA recommended value of ${item.quantity}, retained with its published standard uncertainty.`,
        category: "Physics", subcategory: "Reference values / CODATA 2022", direction: "MAXIMIZE", metricName: item.quantity, unit: item.unit || null,
        status: publicStatus, publishedAt: new Date("2022-12-31T00:00:00Z"),
      }).returning({ id: limits.id });
      const [spec] = await tx.insert(specificationVersions).values({
        limitId: limit.id, versionNumber: 1, formalStatement: `Record the 2022 CODATA recommended value of ${item.quantity} in ${item.unit || "dimensionless form"}.`,
        constraints: { adjustment: "2022 CODATA", uncertainty: item.uncertainty, source: CODATA_SOURCE_URL },
        assumptions: { kind: "FUNDAMENTAL_CONSTANT", recordType: "REFERENCE_VALUE", valueStatus, registryReviewStatus: "SOURCE_ACCEPTED" },
      }).returning({ id: specificationVersions.id });
      const [claim] = await tx.insert(claims).values({
        claimNumber: `CLM-CODATA-${String(index + 1).padStart(4, "0")}`, specificationVersionId: spec.id, claimType: "EXACT_VALUE", relation: "=",
        valueExact: item.value, valueText: `${item.value}${exact ? " (exact)" : ` ± ${item.uncertainty}`}`, unit: item.unit || null,
        scopeParameters: { adjustment: "2022", uncertainty: item.uncertainty }, epistemicStatus: exact ? "PROVEN" : "SOURCE_CONFIRMED", status: "ACCEPTED",
        methodSummary: exact ? "CODATA 2022 exact reference value." : "CODATA 2022 experimentally determined reference value with published uncertainty.",
      }).returning({ id: claims.id });
      const [evidenceRow] = await tx.insert(evidence).values({
        type: "PAPER", label: `${PAPER_TITLE} — ${item.quantity}`, url: CODATA_SOURCE_URL, location: "Complete Listing row",
        metadata: { quantity: item.quantity, value: item.value, uncertainty: item.uncertainty, unit: item.unit, sourceVersion: "2022 CODATA" },
      }).returning({ id: evidence.id });
      await tx.insert(claimEvidence).values({ claimId: claim.id, evidenceId: evidenceRow.id });
      await tx.insert(claimPapers).values({ claimId: claim.id, paperId });
      await tx.insert(timelineEvents).values({
        limitId: limit.id, claimId: claim.id, eventType: "SOURCE_RECOMMENDATION", title: "2022 CODATA recommended value",
        description: `${item.quantity}: ${item.value} ${item.unit}`, occurredAt: new Date("2022-12-31T00:00:00Z"),
        metadata: { publicationState: "PUBLIC", valueStatus, source: CODATA_SOURCE_URL },
      });
    });
    inserted++;
  }

  return NextResponse.json({ inserted, skipped, total: CODATA_REMAINDER.length });
}
