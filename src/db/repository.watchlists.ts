import "server-only";
import { and, asc, eq, inArray, lt, lte, or } from "drizzle-orm";
import { db } from "./client";
import { follows, limits, notifications, watchlistEvents } from "./schema";
import { nextRetryAt, shouldRetry } from "../watchlists/retry";
import { verifyUnsubscribe } from "../watchlists/security";
export type WatchFrequency = "INSTANT" | "WEEKLY";

export async function listUserFollows(subscriberKey: string) {
  return db.select({ follow: follows, limit: { id: limits.id, registryNumber: limits.registryNumber, title: limits.title, status: limits.status } }).from(follows).innerJoin(limits, eq(limits.id, follows.limitId)).where(eq(follows.subscriberKey, subscriberKey)).orderBy(asc(limits.registryNumber));
}
export async function subscribeToLimit(input: { subscriberKey: string; email: string; limitId: string; frequency: WatchFrequency }) {
  const [limit] = await db.select({ id: limits.id }).from(limits).where(and(eq(limits.id, input.limitId), inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"])));
  if (!limit) throw new Error("Only published Limits can be followed.");
  const [follow] = await db.insert(follows).values({ ...input, email: input.email.toLowerCase(), enabled: true, unsubscribedAt: null }).onConflictDoUpdate({ target: [follows.limitId, follows.subscriberKey], set: { email: input.email.toLowerCase(), frequency: input.frequency, enabled: true, unsubscribedAt: null, updatedAt: new Date() } }).returning();
  return follow;
}
export async function updateFollowPreference(input: { id: string; subscriberKey: string; frequency: WatchFrequency }) {
  const [follow] = await db.update(follows).set({ frequency: input.frequency, enabled: true, unsubscribedAt: null, updatedAt: new Date() }).where(and(eq(follows.id, input.id), eq(follows.subscriberKey, input.subscriberKey))).returning();
  if (!follow) throw new Error("Watchlist entry not found."); return follow;
}
export async function unsubscribeFollow(input: { id: string; subscriberKey: string }) {
  const [follow] = await db.update(follows).set({ enabled: false, unsubscribedAt: new Date(), updatedAt: new Date() }).where(and(eq(follows.id, input.id), eq(follows.subscriberKey, input.subscriberKey))).returning();
  if (!follow) throw new Error("Watchlist entry not found."); return follow;
}
export async function unsubscribeWithToken(input: { id: string; token: string }) {
  const [follow] = await db.select().from(follows).where(eq(follows.id, input.id));
  if (!follow || !verifyUnsubscribe(follow.id, follow.email, input.token)) throw new Error("Invalid or expired unsubscribe link.");
  const [updated] = await db.update(follows).set({ enabled: false, unsubscribedAt: new Date(), updatedAt: new Date() }).where(eq(follows.id, follow.id)).returning(); return updated;
}

export type ClaimedNotification = Awaited<ReturnType<typeof claimDueNotifications>>[number];
export async function claimDueNotifications(frequency: WatchFrequency, batchSize = 100) {
  const candidates = await db.select({ notification: notifications, follow: follows, limit: { registryNumber: limits.registryNumber, title: limits.title }, event: watchlistEvents }).from(notifications).innerJoin(follows, eq(follows.id, notifications.followId)).innerJoin(limits, eq(limits.id, follows.limitId)).innerJoin(watchlistEvents, eq(watchlistEvents.id, notifications.watchlistEventId)).where(and(eq(follows.enabled, true), eq(follows.frequency, frequency), or(eq(notifications.status, "PENDING"), eq(notifications.status, "FAILED")), lt(notifications.attempts, 5), lte(notifications.nextAttemptAt, new Date()))).orderBy(asc(notifications.createdAt)).limit(batchSize);
  const claimed = [];
  for (const row of candidates) {
    const [notification] = await db.update(notifications).set({ status: "SENDING", attempts: row.notification.attempts + 1, updatedAt: new Date() }).where(and(eq(notifications.id, row.notification.id), eq(notifications.status, row.notification.status), eq(notifications.attempts, row.notification.attempts))).returning();
    if (notification) claimed.push({ ...row, notification });
  }
  return claimed;
}
export async function markNotificationsSent(ids: string[], providerMessageId?: string | null) { if (!ids.length) return; await db.update(notifications).set({ status: "SENT", deliveredAt: new Date(), providerMessageId: providerMessageId ?? null, lastError: null, updatedAt: new Date() }).where(inArray(notifications.id, ids)); }
export async function markNotificationsFailed(rows: Array<{ id: string; attempts: number }>, error: string) { for (const row of rows) await db.update(notifications).set({ status: "FAILED", lastError: error.slice(0, 1000), nextAttemptAt: nextRetryAt(row.attempts), updatedAt: new Date() }).where(eq(notifications.id, row.id)); }
export async function recoverStaleDeliveries() { const cutoff = new Date(Date.now() - 15 * 60_000); await db.update(notifications).set({ status: "FAILED", lastError: "Delivery lease expired before completion.", nextAttemptAt: new Date(), updatedAt: new Date() }).where(and(eq(notifications.status, "SENDING"), lt(notifications.updatedAt, cutoff))); }
export { shouldRetry };
