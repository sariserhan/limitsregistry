import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, claimPeople, people, personClaimRequests, user } from "./schema";

export async function listResearchers() {
  return db.select({ person: people, creditedClaims: count(claimPeople.claimId) })
    .from(people)
    .leftJoin(claimPeople, eq(claimPeople.personId, people.id))
    .groupBy(people.id)
    .orderBy(desc(count(claimPeople.claimId)), people.displayName);
}

export async function getPendingPersonClaimRequest(personId: string, userId: string) {
  const rows = await db.select().from(personClaimRequests).where(and(eq(personClaimRequests.personId, personId), eq(personClaimRequests.requestedByUserId, userId), eq(personClaimRequests.status, "PENDING"))).limit(1);
  return rows[0] ?? null;
}

export async function submitPersonClaimRequest(input: { personId: string; requestedByUserId: string; verificationNote: string }) {
  const note = input.verificationNote.trim();
  if (note.length < 20) throw new Error("Explain how we can verify this is you (at least 20 characters) — an ORCID, institutional email, or homepage listing your work.");
  const existing = await getPendingPersonClaimRequest(input.personId, input.requestedByUserId);
  if (existing) throw new Error("You already have a pending claim request for this profile.");
  const [request] = await db.insert(personClaimRequests).values({ personId: input.personId, requestedByUserId: input.requestedByUserId, verificationNote: note }).returning();
  return request;
}

export async function listPendingPersonClaimRequests() {
  return db.select({ request: personClaimRequests, requester: { id: user.id, name: user.name, email: user.email }, person: { id: people.id, displayName: people.displayName } })
    .from(personClaimRequests)
    .innerJoin(user, eq(user.id, personClaimRequests.requestedByUserId))
    .innerJoin(people, eq(people.id, personClaimRequests.personId))
    .where(eq(personClaimRequests.status, "PENDING"))
    .orderBy(desc(personClaimRequests.createdAt));
}

export async function reviewPersonClaimRequest(input: { id: string; decision: "APPROVED" | "REJECTED"; reviewerUserId: string; reviewNotes: string }) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(personClaimRequests).where(eq(personClaimRequests.id, input.id));
    if (!current) throw new Error("Claim request not found.");
    if (current.status !== "PENDING") throw new Error("This claim request has already been decided.");
    const [updated] = await tx.update(personClaimRequests).set({ status: input.decision, reviewedByUserId: input.reviewerUserId, reviewNotes: input.reviewNotes.trim() || null, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(personClaimRequests.id, input.id)).returning();
    if (input.decision === "APPROVED") {
      await tx.update(people).set({ claimedByUserId: current.requestedByUserId, profileStatus: "CLAIMED", updatedAt: new Date() }).where(eq(people.id, current.personId));
    }
    await tx.insert(auditLogs).values({ actorUserId: input.reviewerUserId, action: `PERSON_CLAIM_${input.decision}`, entityType: "PERSON_CLAIM_REQUEST", entityId: input.id, before: current, after: updated, reason: input.reviewNotes.trim() || null });
    return updated;
  });
}
