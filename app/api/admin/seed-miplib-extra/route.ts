import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { limits, specificationVersions, claims, evidence, claimEvidence, papers, claimPapers, timelineEvents, auditLogs } from "../../../../src/db/schema";
import { MIPLIB_SOLUTION_URL, MIPLIB_PAPER_URL, MIPLIB_RELEASE_DATE, miplibInstanceUrl, miplibRegistryNumber, miplibSlug } from "../../../../src/catalog/miplib";
import { MIPLIB_EXTRA } from "../../../../src/catalog/miplib-extra";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

const PAPER_TITLE = "MIPLIB 2017: Data-Driven Compilation of the 6th Mixed-Integer Programming Library";
const summaryFor = (instance: string) => `MIPLIB is the standard benchmark library for mixed-integer programming — optimization problems over both continuous and integer-valued variables, used across logistics, scheduling, and engineering. This record cites the proven optimal objective value for the MIPLIB instance ${instance}, according to version 36 of the official solution catalog.`;

// Extends scripts/seed-miplib-2017.ts's 232-instance curated-benchmark import with 150 more
// genuinely proven-optimal (=opt=) instances from the same official solution file, using
// registry numbers starting at index 232 (LR-002232) so nothing collides with the existing batch.
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let paperId: string;
  const existingPaper = await db.select({ id: papers.id }).from(papers).where(eq(papers.title, PAPER_TITLE)).limit(1);
  if (existingPaper.length) { paperId = existingPaper[0].id; } else {
    const [paper] = await db.insert(papers).values({
      title: PAPER_TITLE, abstract: "The official MIPLIB 2017 benchmark methodology, instance collection, solution validation, and versioned optimal objective catalog.",
      publicationDate: new Date("2021-12-01T00:00:00Z"), venue: "Mathematical Programming Computation", doi: "10.1007/s12532-020-00194-3", publisherUrl: MIPLIB_PAPER_URL,
    }).returning({ id: papers.id });
    paperId = paper.id;
  }

  let inserted = 0, skipped = 0;
  for (let i = 0; i < MIPLIB_EXTRA.length; i++) {
    const item = MIPLIB_EXTRA[i];
    const index = 232 + i;
    const registryNumber = miplibRegistryNumber(index);
    const slug = miplibSlug(item.instance);
    const existing = await db.select({ id: limits.id }).from(limits).where(eq(limits.registryNumber, registryNumber)).limit(1);
    if (existing.length) { skipped++; continue; }
    const instanceUrl = miplibInstanceUrl(item.instance);

    await db.transaction(async (tx) => {
      const [limit] = await tx.insert(limits).values({
        registryNumber, slug, title: `MIPLIB optimal objective — ${item.instance}`, summary: summaryFor(item.instance),
        category: "Computing", subcategory: "Mixed-integer optimization / MIPLIB 2017", direction: "MINIMIZE", metricName: "Objective value",
        status: "PROVEN", publishedAt: MIPLIB_RELEASE_DATE,
      }).returning({ id: limits.id });
      const [spec] = await tx.insert(specificationVersions).values({
        limitId: limit.id, versionNumber: 1, formalStatement: `Minimize the objective of the MIPLIB 2017 benchmark model ${item.instance}.`,
        constraints: { instance: item.instance, solutionCatalogVersion: 36, modelUrl: instanceUrl, objectiveSense: "MINIMIZE" },
        assumptions: { numericalInterpretation: "Use the official MIPLIB model, feasibility tolerances, solution checker, and published objective value.", publicationProcess: "FOUNDING_CATALOG_IMPORT" },
      }).returning({ id: specificationVersions.id });
      const claimNumberBase = `CLM-MIPLIB-${String(index + 1).padStart(4, "0")}`;
      const [lower] = await tx.insert(claims).values({
        claimNumber: `${claimNumberBase}-LB`, specificationVersionId: spec.id, claimType: "LOWER_BOUND", relation: ">=",
        valueExact: item.objective, valueText: item.objective, scopeParameters: { instance: item.instance, catalogVersion: 36 },
        epistemicStatus: "PROVEN", status: "ACCEPTED", methodSummary: "Official MIPLIB optimality status establishes that no feasible solution has a better minimization objective.",
      }).returning({ id: claims.id });
      const [upper] = await tx.insert(claims).values({
        claimNumber: `${claimNumberBase}-UB`, specificationVersionId: spec.id, claimType: "UPPER_BOUND", relation: "<=",
        valueExact: item.objective, valueText: item.objective, scopeParameters: { instance: item.instance, catalogVersion: 36 },
        epistemicStatus: "SOURCE_CONFIRMED", status: "ACCEPTED", methodSummary: "A feasibility-checked MIPLIB solution attains the published objective value.",
      }).returning({ id: claims.id });
      const [lowerEvidence] = await tx.insert(evidence).values({
        type: "EXHAUSTIVE_COMPUTATION", label: `MIPLIB v36 optimality record — ${item.instance}`, url: MIPLIB_SOLUTION_URL, location: `=opt= ${item.instance}`,
        metadata: { instance: item.instance, objective: item.objective, status: "opt", solutionCatalogVersion: 36 },
      }).returning({ id: evidence.id });
      const [upperEvidence] = await tx.insert(evidence).values({
        type: "DATASET", label: `MIPLIB feasible solution record — ${item.instance}`, url: instanceUrl, location: "Best Known Solution(s)",
        metadata: { instance: item.instance, objective: item.objective, validation: "MIPLIB solution checker", solutionCatalogVersion: 36 },
      }).returning({ id: evidence.id });
      await tx.insert(claimEvidence).values([{ claimId: lower.id, evidenceId: lowerEvidence.id }, { claimId: upper.id, evidenceId: upperEvidence.id }]);
      await tx.insert(claimPapers).values([{ claimId: lower.id, paperId }, { claimId: upper.id, paperId }]);
      await tx.insert(timelineEvents).values({
        limitId: limit.id, eventType: "REGISTRY_PUBLICATION", title: "Published from official MIPLIB v36 catalog",
        description: `Matching proven lower and feasible upper bounds establish objective ${item.objective}.`, occurredAt: MIPLIB_RELEASE_DATE,
        metadata: { batch: "MIPLIB_2017_V36_EXTRA", publicationProcess: "FOUNDING_CATALOG_IMPORT", source: MIPLIB_SOLUTION_URL },
      });
      await tx.insert(auditLogs).values([
        { action: "FOUNDING_CATALOG_CLAIM_ACCEPTED", entityType: "CLAIM", entityId: lower.id, after: { status: "ACCEPTED", relation: ">=", value: item.objective }, reason: "Official MIPLIB v36 =opt= benchmark import" },
        { action: "FOUNDING_CATALOG_CLAIM_ACCEPTED", entityType: "CLAIM", entityId: upper.id, after: { status: "ACCEPTED", relation: "<=", value: item.objective }, reason: "Official MIPLIB v36 =opt= benchmark import" },
        { action: "FOUNDING_CATALOG_LIMIT_PUBLISHED", entityType: "LIMIT", entityId: limit.id, after: { status: "PROVEN", publishedAt: MIPLIB_RELEASE_DATE.toISOString() }, reason: "Matching official lower and upper objective bounds" },
      ]);
    });
    inserted++;
  }

  return NextResponse.json({ inserted, skipped, total: MIPLIB_EXTRA.length });
}
