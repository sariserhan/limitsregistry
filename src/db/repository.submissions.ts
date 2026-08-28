import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { limits, proofAttachments, submissions, user } from "./schema";

export async function listSubmissions() {
  return db.select({ submission: submissions, submitter: { name: user.name, email: user.email }, limit: { registryNumber: limits.registryNumber, title: limits.title }, proof: { id: proofAttachments.id, filename: proofAttachments.filename, mimeType: proofAttachments.mimeType, sizeBytes: proofAttachments.sizeBytes } })
    .from(submissions)
    .innerJoin(user, eq(user.id, submissions.submitterUserId))
    .innerJoin(limits, eq(limits.id, submissions.limitId))
    .leftJoin(proofAttachments, eq(proofAttachments.submissionId, submissions.id))
    .orderBy(desc(submissions.createdAt));
}

export async function listSubmissionsByUser(userId: string) {
  return db.select({ submission: submissions, limit: { registryNumber: limits.registryNumber, title: limits.title }, proof: { id: proofAttachments.id, filename: proofAttachments.filename, mimeType: proofAttachments.mimeType, sizeBytes: proofAttachments.sizeBytes } })
    .from(submissions)
    .innerJoin(limits, eq(limits.id, submissions.limitId))
    .leftJoin(proofAttachments, eq(proofAttachments.submissionId, submissions.id))
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

export async function insertProofAttachment(input: { submissionId: string; filename: string; mimeType: string; sizeBytes: number; contents: Buffer }) {
  const [row] = await db.insert(proofAttachments).values(input).returning({ id: proofAttachments.id });
  return row;
}

export async function getProofAttachment(id: string) {
  const rows = await db.select({ attachment: proofAttachments, submitterUserId: submissions.submitterUserId }).from(proofAttachments).innerJoin(submissions, eq(submissions.id, proofAttachments.submissionId)).where(eq(proofAttachments.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function setSubmissionStatus(id: string, status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "NEEDS_REVISION", reviewedByUserId: string, reviewerNotes: string) {
  await db.update(submissions).set({ status, reviewedByUserId, reviewerNotes, updatedAt: new Date() }).where(eq(submissions.id, id));
}

export async function listPublicSubmissionHistory(limitId: string) {
  return db.select({ submission: { id: submissions.id, title: submissions.title, proposedRelation: submissions.proposedRelation, proposedValueExact: submissions.proposedValueExact, status: submissions.status, createdAt: submissions.createdAt, reviewerNotes: submissions.reviewerNotes }, submitter: { name: user.name } }).from(submissions).innerJoin(user, eq(user.id, submissions.submitterUserId)).where(eq(submissions.limitId, limitId)).orderBy(desc(submissions.createdAt));
}

export async function getSubmissionNotification(id: string) {
  const rows = await db.select({ submission: submissions, submitter: { name: user.name, email: user.email }, limit: { registryNumber: limits.registryNumber, title: limits.title } }).from(submissions).innerJoin(user, eq(user.id, submissions.submitterUserId)).innerJoin(limits, eq(limits.id, submissions.limitId)).where(eq(submissions.id, id)).limit(1);
  return rows[0] ?? null;
}
