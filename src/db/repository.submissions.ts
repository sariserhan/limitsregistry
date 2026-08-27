import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { limits, submissions, user } from "./schema";

export async function listSubmissions() {
  return db.select({ submission: submissions, submitter: { name: user.name, email: user.email }, limit: { registryNumber: limits.registryNumber, title: limits.title } })
    .from(submissions)
    .innerJoin(user, eq(user.id, submissions.submitterUserId))
    .innerJoin(limits, eq(limits.id, submissions.limitId))
    .orderBy(desc(submissions.createdAt));
}

export async function listSubmissionsByUser(userId: string) {
  return db.select({ submission: submissions, limit: { registryNumber: limits.registryNumber, title: limits.title } })
    .from(submissions)
    .innerJoin(limits, eq(limits.id, submissions.limitId))
    .where(eq(submissions.submitterUserId, userId))
    .orderBy(desc(submissions.createdAt));
}

export type NewSubmission = {
  submitterUserId: string;
  limitId: string;
  submissionType: "BETTER_ACHIEVABLE_RESULT" | "STRONGER_BOUND" | "PROOF" | "REPRODUCTION" | "CORRECTION";
  title: string;
  description: string;
  proposedRelation?: "<" | "<=" | "=" | ">=" | ">";
  proposedValueExact?: string;
  evidenceUrl?: string;
};

export async function insertSubmission(input: NewSubmission) {
  const [row] = await db.insert(submissions).values(input).returning();
  return row;
}

export async function setSubmissionStatus(id: string, status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "NEEDS_REVISION", reviewedByUserId: string, reviewerNotes: string) {
  await db.update(submissions).set({ status, reviewedByUserId, reviewerNotes, updatedAt: new Date() }).where(eq(submissions.id, id));
}
