import "server-only";
import { and, desc, sql } from "drizzle-orm";
import { db } from "./client";
import { acquisitionEvents } from "./schema";

export async function recordAcquisitionEvent(input: { eventName: string; path: string; referrer?: string | null }) {
  if (!/^[a-z0-9_.-]{1,48}$/.test(input.eventName) || !input.path.startsWith("/") || input.path.length > 500) return null;
  const [row] = await db.insert(acquisitionEvents).values({ eventName: input.eventName, path: input.path, referrer: input.referrer?.slice(0, 500) || null }).returning({ id: acquisitionEvents.id });
  return row ?? null;
}

export async function getAcquisitionReport(days = 30) {
  const since = new Date(Date.now() - Math.min(Math.max(days, 1), 365) * 86400000);
  const [totals, paths, referrers] = await Promise.all([
    db.select({ eventName: acquisitionEvents.eventName, count: sql<number>`count(*)::int` }).from(acquisitionEvents).where(sql`${acquisitionEvents.createdAt} >= ${since}`).groupBy(acquisitionEvents.eventName).orderBy(desc(sql`count(*)`)),
    db.select({ path: acquisitionEvents.path, count: sql<number>`count(*)::int` }).from(acquisitionEvents).where(and(sql`${acquisitionEvents.createdAt} >= ${since}`, sql`${acquisitionEvents.eventName} = 'page_view'`)).groupBy(acquisitionEvents.path).orderBy(desc(sql`count(*)`)).limit(25),
    db.select({ referrer: acquisitionEvents.referrer, count: sql<number>`count(*)::int` }).from(acquisitionEvents).where(and(sql`${acquisitionEvents.createdAt} >= ${since}`, sql`${acquisitionEvents.referrer} is not null`)).groupBy(acquisitionEvents.referrer).orderBy(desc(sql`count(*)`)).limit(25),
  ]);
  return { days, totals, paths, referrers };
}

export async function getAcquisitionReportSafe(days = 30) {
  try {
    return { available: true, report: await getAcquisitionReport(days) };
  } catch {
    return { available: false, report: { days, totals: [], paths: [], referrers: [] } };
  }
}
