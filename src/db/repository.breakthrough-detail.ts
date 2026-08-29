import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { breakthroughEvents, claimPapers, claimPeople, claims, limits, papers, people } from "./schema";

export async function getPublicBreakthroughEvent(id: string) {
  const [row] = await db.select({ event: breakthroughEvents, claim: claims, limit: limits }).from(breakthroughEvents).leftJoin(claims, eq(claims.id, breakthroughEvents.claimId)).innerJoin(limits, eq(limits.id, breakthroughEvents.limitId)).where(eq(breakthroughEvents.id, id)).limit(1);
  if (!row || !["OPEN", "PROVEN", "DISPUTED", "RETIRED"].includes(row.limit.status)) return null;
  const [paperRows, personRows] = row.claim ? await Promise.all([
    db.select({ id: papers.id, title: papers.title, publisherUrl: papers.publisherUrl, doi: papers.doi, arxivId: papers.arxivId }).from(claimPapers).innerJoin(papers, eq(papers.id, claimPapers.paperId)).where(eq(claimPapers.claimId, row.claim.id)),
    db.select({ id: people.id, displayName: people.displayName, orcid: people.orcid }).from(claimPeople).innerJoin(people, eq(people.id, claimPeople.personId)).where(eq(claimPeople.claimId, row.claim.id)),
  ]) : [[], []];
  return { ...row, papers: paperRows, people: personRows };
}
