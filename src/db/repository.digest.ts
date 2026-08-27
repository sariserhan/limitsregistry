import "server-only";
import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "./client";
import { claims, limits, specificationVersions, submissions, user } from "./schema";

export type WeeklyDigestData = {
  since: Date;
  newlyPublished: { registryNumber: string; title: string }[];
  acceptedClaims: { claimNumber: string; registryNumber: string; title: string }[];
  newSubmissions: { title: string; registryNumber: string; status: string }[];
};

export async function getWeeklyDigestData(): Promise<WeeklyDigestData> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const newlyPublished = await db.select({ registryNumber: limits.registryNumber, title: limits.title })
    .from(limits)
    .where(and(inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"]), gte(limits.publishedAt, since)));

  const acceptedClaimRows = await db.select({ claimNumber: claims.claimNumber, registryNumber: limits.registryNumber, title: limits.title })
    .from(claims)
    .innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId))
    .innerJoin(limits, eq(limits.id, specificationVersions.limitId))
    .where(and(eq(claims.status, "ACCEPTED"), gte(claims.updatedAt, since)));

  const newSubmissionRows = await db.select({ title: submissions.title, registryNumber: limits.registryNumber, status: submissions.status })
    .from(submissions)
    .innerJoin(limits, eq(limits.id, submissions.limitId))
    .where(gte(submissions.createdAt, since));

  return { since, newlyPublished, acceptedClaims: acceptedClaimRows, newSubmissions: newSubmissionRows };
}

/** Editorial staff who'd want a weekly ops summary — not a public/opt-in newsletter, so no consent question applies. */
export async function listDigestRecipients() {
  return db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(inArray(user.role, ["EDITOR", "ADMIN", "SUPERADMIN"]));
}
