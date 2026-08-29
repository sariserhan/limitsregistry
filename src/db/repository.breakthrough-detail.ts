import "server-only";
import { eq } from "drizzle-orm";
import { getLimitResearchData } from "./repository";
import { deriveFrontier } from "../domain/frontier";
import { formatExact } from "../domain/published";
import { db } from "./client";
import { breakthroughEvents, claimPapers, claimPeople, claims, limits, papers, people } from "./schema";

export async function getPublicBreakthroughEvent(id: string) {
  const [row] = await db.select({ event: breakthroughEvents, claim: claims, limit: limits }).from(breakthroughEvents).leftJoin(claims, eq(claims.id, breakthroughEvents.claimId)).innerJoin(limits, eq(limits.id, breakthroughEvents.limitId)).where(eq(breakthroughEvents.id, id)).limit(1);
  if (!row || !["OPEN", "PROVEN", "DISPUTED", "RETIRED"].includes(row.limit.status)) return null;
  const [paperRows, personRows] = row.claim ? await Promise.all([
    db.select({ id: papers.id, title: papers.title, publisherUrl: papers.publisherUrl, doi: papers.doi, arxivId: papers.arxivId }).from(claimPapers).innerJoin(papers, eq(papers.id, claimPapers.paperId)).where(eq(claimPapers.claimId, row.claim.id)),
    db.select({ id: people.id, displayName: people.displayName, orcid: people.orcid }).from(claimPeople).innerJoin(people, eq(people.id, claimPeople.personId)).where(eq(claimPeople.claimId, row.claim.id)),
  ]) : [[], []];
  const research = row.claim ? await getLimitResearchData(row.limit.id) : null;
  const currentClaim = research?.claims.find((claim) => claim.id === row.claim?.claimNumber);
  const priorClaims = currentClaim ? research!.claims.filter((claim) => claim.id !== currentClaim.id) : research?.claims ?? [];
  const previousFrontier = research?.specification ? deriveFrontier(row.limit.direction, research.specification, priorClaims) : null;
  const currentFrontier = research?.specification ? deriveFrontier(row.limit.direction, research.specification, research.claims) : null;
  return { ...row, papers: paperRows, people: personRows, previousValue: previousFrontier ? formatExact(previousFrontier.lowerBound ?? previousFrontier.upperBound ?? previousFrontier.achievable) : "?", newValue: currentFrontier ? formatExact(currentFrontier.lowerBound ?? currentFrontier.upperBound ?? currentFrontier.achievable) : row.claim?.valueExact ?? "?" };
}
