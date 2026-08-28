import "server-only";
import { unstable_cache } from "next/cache";
import { desc, eq, inArray } from "drizzle-orm";
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

// Site-wide feed — only ever reads from a table that's exclusively written by
// detectAndRecordBreakthroughs after a real ACCEPTED transition, so every row here already
// passed the draft/disputed guard; no extra published-only filtering is needed at read time.
export async function listRecentBreakthroughEvents(resultLimit = 50) {
  const read = unstable_cache(async () => {
    const rows = await db.select({ event: breakthroughEvents, claimNumber: claims.claimNumber, relation: claims.relation, valueExact: claims.valueExact })
      .from(breakthroughEvents)
      .leftJoin(claims, eq(claims.id, breakthroughEvents.claimId))
      .orderBy(desc(breakthroughEvents.occurredAt))
      .limit(resultLimit);
    if (rows.length === 0) return [];
    const limitRows = await db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title }).from(limits).where(inArray(limits.id, [...new Set(rows.map((r) => r.event.limitId))]));
    const limitById = new Map(limitRows.map((l) => [l.id, l]));
    return rows.flatMap((row) => { const limit = limitById.get(row.event.limitId); return limit ? [{ ...row, limit }] : []; });
  }, ["recent-breakthroughs", String(resultLimit)], { revalidate: 60, tags: ["breakthroughs"] });
  const rows = await read();
  // occurredAt round-trips through unstable_cache's JSON cache as a string despite its Date type.
  return rows.map((row) => ({ ...row, event: { ...row.event, occurredAt: new Date(row.event.occurredAt) } }));
}

async function persistBreakthroughEvents(events: BreakthroughDetection[], limitId: string, claimId: string, actorUserId: string) {
  // One transaction per event: the watchlist_events row is guarded by a DB trigger
  // (enforce_published_watchlist_event) that rejects publishing until the Claim is ACCEPTED and
  // its Limit is public — a second, DB-level line of defense behind this function's own caller
  // guard. Without the transaction, a trigger rejection here would still leave the immutable
  // breakthroughEvents row committed, an orphan visible on the public Timeline with no
  // corresponding published watchlist projection.
  for (const event of events) {
    await db.transaction(async (tx) => {
      const occurredAt = new Date();
      const [row] = await tx.insert(breakthroughEvents).values({ limitId, claimId, eventType: event.eventType, occurredAt }).returning();
      // sourceEntityId is the breakthroughEvents row's own id, not claimId — a single ACCEPTED
      // claim can produce more than one STRONGER_BOUND detection (e.g. both bounds tightened at
      // once), and watchlistEvents has a unique index on (sourceEntityType, sourceEntityId,
      // eventType) that would collide if they all pointed at the same claimId.
      await tx.insert(watchlistEvents).values({ limitId, eventType: event.eventType, sourceEntityType: "BREAKTHROUGH_EVENT", sourceEntityId: row.id, payload: { claimId, detail: event.detail }, publishedAt: occurredAt }).onConflictDoNothing();
      await tx.insert(auditLogs).values({ actorUserId, action: `BREAKTHROUGH_${event.eventType}`, entityType: "LIMIT", entityId: limitId, after: { breakthroughEventId: row.id, claimId, eventType: event.eventType, detail: event.detail } });
    });
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
  // A DRAFT Limit's Claims can be ACCEPTED editorially before the Limit itself is published —
  // matches shouldPublishAcceptedClaimEvent's own gate so a still-unpublished Limit never leaks
  // a breakthrough onto the public feed.
  if (!limit || (limit.status !== "OPEN" && limit.status !== "PROVEN")) return [];

  const siblingClaims = await db.select().from(claims).where(eq(claims.specificationVersionId, spec.id));
  const detections = detectBreakthroughs(limit.direction, serializeSpecification(spec), siblingClaims.map((c) => serializeClaim(c)), serializeClaim(claim));
  if (detections.length > 0) await persistBreakthroughEvents(detections, limit.id, claim.id, actorUserId);
  return detections;
}
