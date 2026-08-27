import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { candidateClaims, claims, limits, papers, specificationVersions } from "./schema";
import type { FetchedPaper } from "../lib/ingestion/crossref";

export async function listPapers() {
  return db.select().from(papers).orderBy(desc(papers.createdAt));
}

export async function insertPaper(meta: FetchedPaper) {
  const rows = await db.insert(papers).values({ title: meta.title, abstract: meta.abstract, publicationDate: meta.publicationDate, venue: meta.venue, doi: meta.doi, arxivId: meta.arxivId, publisherUrl: meta.publisherUrl }).returning();
  return rows[0];
}

export async function listAllLimits() {
  return db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title }).from(limits).orderBy(desc(limits.createdAt));
}

export async function listCandidateClaims() {
  return db.select().from(candidateClaims).orderBy(desc(candidateClaims.createdAt));
}

export async function insertCandidateClaim(input: { paperId: string; limitId: string | null; extraction: Record<string, unknown>; model: string; promptVersion: string }) {
  const rows = await db.insert(candidateClaims).values(input).returning();
  return rows[0];
}

export async function setCandidateClaimStatus(id: string, status: "PROMOTED" | "DISMISSED", reviewedByUserId: string) {
  await db.update(candidateClaims).set({ status, reviewedByUserId, updatedAt: new Date() }).where(eq(candidateClaims.id, id));
}

/** Accepted claims for a Limit's current specification versions, for the console's contradiction check. */
export async function getAcceptedBoundsForLimit(limitId: string) {
  const rows = await db.select({ relation: claims.relation, valueNumeric: claims.valueNumeric })
    .from(claims)
    .innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId))
    .where(and(eq(specificationVersions.limitId, limitId), eq(claims.status, "ACCEPTED")));
  return rows.filter((r) => r.valueNumeric !== null).map((r) => ({ relation: r.relation, valueNumeric: Number(r.valueNumeric) }));
}
