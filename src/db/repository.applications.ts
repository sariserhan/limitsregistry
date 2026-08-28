import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, editorialApplications, reviewerProfiles, user } from "./schema";

export type EditorialApplicationType = "REVIEWER" | "EDITOR";
export type EditorialApplicationDecision = "APPROVED" | "REJECTED";

export async function listApplicationsByUser(userId: string) {
  return db.select().from(editorialApplications).where(eq(editorialApplications.applicantUserId, userId)).orderBy(desc(editorialApplications.createdAt));
}

export async function listEditorialApplications(applicationType?: EditorialApplicationType) {
  return db.select({
    application: editorialApplications,
    applicant: { id: user.id, name: user.name, email: user.email, role: user.role },
  }).from(editorialApplications).innerJoin(user, eq(user.id, editorialApplications.applicantUserId))
    .where(applicationType ? eq(editorialApplications.applicationType, applicationType) : undefined)
    .orderBy(desc(editorialApplications.createdAt));
}

export async function createEditorialApplication(input: {
  applicantUserId: string;
  applicationType: EditorialApplicationType;
  affiliation: string;
  orcid?: string;
  website?: string;
  fieldsOfExpertise: string[];
  credentials: string;
  motivation: string;
  conflictDisclosure: boolean;
}) {
  const existing = await db.select({ id: editorialApplications.id }).from(editorialApplications)
    .where(and(eq(editorialApplications.applicantUserId, input.applicantUserId), eq(editorialApplications.applicationType, input.applicationType), eq(editorialApplications.status, "PENDING"))).limit(1);
  if (existing.length) throw new Error("You already have a pending application for this access level.");
  const [application] = await db.insert(editorialApplications).values({
    ...input,
    orcid: input.orcid || null,
    website: input.website || null,
    fieldsOfExpertise: input.fieldsOfExpertise,
  }).returning();
  return application;
}

export async function decideEditorialApplication(input: {
  id: string;
  decision: EditorialApplicationDecision;
  reviewerUserId: string;
  reviewNotes: string;
}) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(editorialApplications).where(eq(editorialApplications.id, input.id));
    if (!current) throw new Error("Application not found.");
    if (current.status !== "PENDING") throw new Error("This application has already been decided.");
    const [updated] = await tx.update(editorialApplications).set({
      status: input.decision,
      reviewedByUserId: input.reviewerUserId,
      reviewNotes: input.reviewNotes.trim() || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(editorialApplications.id, input.id)).returning();
    if (input.decision === "APPROVED") {
      await tx.update(user).set({ role: current.applicationType, updatedAt: new Date() }).where(eq(user.id, current.applicantUserId));
      if (current.applicationType === "REVIEWER") {
        await tx.insert(reviewerProfiles).values({
          userId: current.applicantUserId,
          fieldsOfExpertise: current.fieldsOfExpertise,
          credentials: current.credentials,
          bio: current.motivation,
        }).onConflictDoUpdate({ target: reviewerProfiles.userId, set: {
          fieldsOfExpertise: current.fieldsOfExpertise,
          credentials: current.credentials,
          bio: current.motivation,
          updatedAt: new Date(),
        }});
      }
    }
    await tx.insert(auditLogs).values({
      actorUserId: input.reviewerUserId,
      action: `EDITORIAL_APPLICATION_${input.decision}`,
      entityType: "EDITORIAL_APPLICATION",
      entityId: input.id,
      before: current,
      after: updated,
      reason: input.reviewNotes.trim() || null,
    });
    return updated;
  });
}
