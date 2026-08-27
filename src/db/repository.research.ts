import "server-only";
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, breakthroughEvents, dependencyRelations, limits, researchBounties, verificationArtifacts, watchlistEvents } from "./schema";
import { validateDependency, type DependencyRelation, type DependencyReviewStatus } from "../domain/dependencies";

export type DependencyRecord = Awaited<ReturnType<typeof listDependencies>>[number];

async function enrichDependencies(rows: (typeof dependencyRelations.$inferSelect)[]) {
  const ids = [...new Set(rows.flatMap((row) => [row.sourceLimitId, row.targetLimitId]))];
  if (!ids.length) return [];
  const records = await db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, status: limits.status }).from(limits).where(inArray(limits.id, ids));
  const byId = new Map(records.map((record) => [record.id, record]));
  return rows.flatMap((edge) => {
    const source = byId.get(edge.sourceLimitId);
    const target = byId.get(edge.targetLimitId);
    return source && target ? [{ ...edge, source, target }] : [];
  });
}

export async function listDependencies() {
  return enrichDependencies(await db.select().from(dependencyRelations).orderBy(desc(dependencyRelations.createdAt)));
}

export async function listAcceptedDependencies(limitId?: string) {
  const conditions = [eq(dependencyRelations.reviewStatus, "ACCEPTED")];
  if (limitId) conditions.push(or(eq(dependencyRelations.sourceLimitId, limitId), eq(dependencyRelations.targetLimitId, limitId))!);
  const enriched = await enrichDependencies(await db.select().from(dependencyRelations).where(and(...conditions)).orderBy(desc(dependencyRelations.createdAt)));
  return enriched.filter(({ source, target }) => ["OPEN", "PROVEN"].includes(source.status) && ["OPEN", "PROVEN"].includes(target.status));
}

export async function createDependency(input: { sourceLimitId: string; targetLimitId: string; relation: DependencyRelation; evidenceClaimId?: string | null }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7351771)`);
    const existing = await tx.select().from(dependencyRelations);
    const error = validateDependency({ ...input, reviewStatus: "DRAFT" }, existing);
    if (error) throw new Error(error);
    const knownLimits = await tx.select({ id: limits.id }).from(limits).where(inArray(limits.id, [input.sourceLimitId, input.targetLimitId]));
    if (knownLimits.length !== 2) throw new Error("Both source and target Limits must exist.");
    const [row] = await tx.insert(dependencyRelations).values({ ...input, evidenceClaimId: input.evidenceClaimId || null }).returning();
    return row;
  });
}

export async function decideDependency(input: { id: string; decision: Exclude<DependencyReviewStatus, "DRAFT">; actorUserId: string }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7351771)`);
    const [current] = await tx.select().from(dependencyRelations).where(eq(dependencyRelations.id, input.id));
    if (!current) throw new Error("Dependency not found.");
    if (input.decision === "ACCEPTED") {
      const existing = (await tx.select().from(dependencyRelations)).filter((edge) => edge.id !== current.id);
      const error = validateDependency({ ...current, reviewStatus: "ACCEPTED" }, existing);
      if (error) throw new Error(error);
    }
    const [updated] = await tx.update(dependencyRelations).set({ reviewStatus: input.decision, updatedAt: new Date() }).where(eq(dependencyRelations.id, input.id)).returning();
    await tx.insert(auditLogs).values({ actorUserId: input.actorUserId, action: `DEPENDENCY_${input.decision}`, entityType: "LIMIT_DEPENDENCY", entityId: input.id, before: current, after: updated });
    return updated;
  });
}

export const listVerificationArtifacts = (claimId: string) => db.select().from(verificationArtifacts).where(eq(verificationArtifacts.claimId, claimId)).orderBy(desc(verificationArtifacts.createdAt));
export const listBounties = () => db.select().from(researchBounties).orderBy(desc(researchBounties.createdAt));
export const listBreakthroughEvents = (limitId: string) => db.select().from(breakthroughEvents).where(eq(breakthroughEvents.limitId, limitId)).orderBy(desc(breakthroughEvents.occurredAt));
export const listWatchlistEvents = (limitId: string) => db.select().from(watchlistEvents).where(and(eq(watchlistEvents.limitId, limitId), isNotNull(watchlistEvents.publishedAt))).orderBy(desc(watchlistEvents.createdAt));
