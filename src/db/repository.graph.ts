import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { claimPapers, claims, claimPeople, limits, papers, people, specificationVersions } from "./schema";

const PUBLIC_LIMIT_STATUSES = ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const;

export async function listPublicGraphRelationships(resultLimit = 60) {
  const paperClaims = await db.select({ paperId: papers.id, paperTitle: papers.title, claimId: claims.id, claimNumber: claims.claimNumber, limitId: limits.id, registryNumber: limits.registryNumber, limitTitle: limits.title })
    .from(claimPapers).innerJoin(papers, eq(papers.id, claimPapers.paperId)).innerJoin(claims, and(eq(claims.id, claimPapers.claimId), eq(claims.status, "ACCEPTED"))).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, and(eq(limits.id, specificationVersions.limitId), inArray(limits.status, PUBLIC_LIMIT_STATUSES))).orderBy(asc(papers.title), asc(claims.claimNumber)).limit(Math.min(Math.max(resultLimit, 1), 100));
  if (!paperClaims.length) return { paperClaims, claimPeople: [] };
  const peopleRows = await db.select({ personId: people.id, personName: people.displayName, claimId: claims.id, claimNumber: claims.claimNumber, limitId: limits.id, registryNumber: limits.registryNumber, limitTitle: limits.title })
    .from(claimPeople).innerJoin(people, eq(people.id, claimPeople.personId)).innerJoin(claims, and(eq(claims.id, claimPeople.claimId), eq(claims.status, "ACCEPTED"))).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(limits, and(eq(limits.id, specificationVersions.limitId), inArray(limits.status, PUBLIC_LIMIT_STATUSES))).orderBy(asc(people.displayName), asc(claims.claimNumber)).limit(Math.min(Math.max(resultLimit, 1), 100));
  return { paperClaims, claimPeople: peopleRows };
}
