import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { claimPapers, claimPeople, claims, institutions, limits, papers, people, personInstitutions, specificationVersions } from "./schema";

export async function getPaper(id: string) {
  const rows = await db.select().from(papers).where(eq(papers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getClaimsForPaper(paperId: string) {
  return db.select({ claim: claims, limit: limits })
    .from(claimPapers)
    .innerJoin(claims, eq(claims.id, claimPapers.claimId))
    .innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId))
    .innerJoin(limits, eq(limits.id, specificationVersions.limitId))
    .where(eq(claimPapers.paperId, paperId))
    .orderBy(desc(claims.createdAt));
}

export async function getPerson(id: string) {
  const rows = await db.select().from(people).where(eq(people.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getInstitutionsForPerson(personId: string) {
  return db.select({ institution: institutions, roleLabel: personInstitutions.roleLabel })
    .from(personInstitutions)
    .innerJoin(institutions, eq(institutions.id, personInstitutions.institutionId))
    .where(eq(personInstitutions.personId, personId));
}

export async function getClaimsForPerson(personId: string) {
  return db.select({ claim: claims, limit: limits, contributorRole: claimPeople.contributorRole })
    .from(claimPeople)
    .innerJoin(claims, eq(claims.id, claimPeople.claimId))
    .innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId))
    .innerJoin(limits, eq(limits.id, specificationVersions.limitId))
    .where(eq(claimPeople.personId, personId))
    .orderBy(desc(claims.createdAt));
}

export async function getInstitution(id: string) {
  const rows = await db.select().from(institutions).where(eq(institutions.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPeopleForInstitution(institutionId: string) {
  return db.select({ person: people, roleLabel: personInstitutions.roleLabel })
    .from(personInstitutions)
    .innerJoin(people, eq(people.id, personInstitutions.personId))
    .where(eq(personInstitutions.institutionId, institutionId));
}
