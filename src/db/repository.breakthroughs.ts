import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { breakthroughEvents, watchlistEvents, auditLogs, claims, specificationVersions, limits } from "./schema";
import { serializeClaim, serializeSpecification } from "./serializers";
import { detectBreakthroughs, type BreakthroughDetection } from "../domain/breakthrough";

export async function listBreakthroughEventsForLimit(limitId: string) {
  return db.select({ event: breakthroughEvents, claimNumber: claims.claimNumber, relation: claims.relation, valueExact: claims.valueExact })
    .from(breakthroughEvents)
    .leftJoin(claims, eq(claims.id, breakthroughEvents.claimId))
    .where(eq(breakthroughEvents.limitId, limitId))
    .orderBy(desc(breakthroughEvents.occurredAt));
}

async function persistBreakthroughEvents(events: BreakthroughDetection[], limitId: string, claimId: string, actorUserId: string) {
  for (const event of events) {
    const occurredAt = new Date();
    // Immutable historical record (breakthroughEvents) and the feed-visible projection of the
    // same fact (watchlistEvents, publishedAt set immediately — this only ever runs for an
    // already-ACCEPTED claim, so there's no draft state left to wait out before publishing).
    const [row] = await db.insert(breakthroughEvents).values({ limitId, claimId, eventType: event.eventType, occurredAt }).returning();
    await db.insert(watchlistEvents).values({ limitId, eventType: event.eventType, payload: { claimId, detail: event.detail }, publishedAt: occurredAt });
    await db.insert(auditLogs).values({ actorUserId, action: `BREAKTHROUGH_${event.eventType}`, entityType: "LIMIT", entityId: limitId, after: { breakthroughEventId: row.id, claimId, eventType: event.eventType, detail: event.detail } });
  }
}

/**
 * Detects and persists breakthrough events for a Claim that just transitioned into ACCEPTED.
 * Callers must only invoke this after confirming a real DRAFT/UNDER_REVIEW/etc -> ACCEPTED
 * transition just happened (see updateClaimEditorialStatus) — detectBreakthroughs itself also
 * refuses to fire for anything not currently ACCEPTED, as a second line of defense.
 */
export async function detectAndRecordBreakthroughs(claimId: string, actorUserId: string) {
  const claimRows = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1);
  const claim = claimRows[0];
  if (!claim || claim.status !== "ACCEPTED") return [];

  const specRows = await db.select().from(specificationVersions).where(eq(specificationVersions.id, claim.specificationVersionId)).limit(1);
  const spec = specRows[0];
  if (!spec) return [];

  const limitRows = await db.select().from(limits).where(eq(limits.id, spec.limitId)).limit(1);
  const limit = limitRows[0];
  if (!limit) return [];

  const siblingClaims = await db.select().from(claims).where(eq(claims.specificationVersionId, spec.id));
  const detections = detectBreakthroughs(limit.direction, serializeSpecification(spec), siblingClaims.map((c) => serializeClaim(c)), serializeClaim(claim));
  if (detections.length > 0) await persistBreakthroughEvents(detections, limit.id, claim.id, actorUserId);
  return detections;
}
