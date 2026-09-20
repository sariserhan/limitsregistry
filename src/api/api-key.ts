import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { apiKeys, apiUsageDaily } from "../db/schema";
import { bearerApiKey, hashApiKey } from "./key-token";

export async function resolveApiKey(request: Request) {
  const token = bearerApiKey(request);
  if (!token) return null;
  const [key] = await db.select({ id: apiKeys.id }).from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hashApiKey(token)), eq(apiKeys.status, "ACTIVE"), eq(apiKeys.tier, "PILOT"))).limit(1);
  return key ?? null;
}

// One atomic write only when a download starts. No per-request monthly sum or key-row update.
// 304s, rejected requests, and storage-open failures do not consume usage.
export async function recordSnapshotDownload(keyId: string) {
  await db.insert(apiUsageDaily).values({ keyId, day: sql`(now() at time zone 'UTC')::date`, downloads: 1 })
    .onConflictDoUpdate({ target: [apiUsageDaily.keyId, apiUsageDaily.day], set: {
      downloads: sql`${apiUsageDaily.downloads} + 1`, lastDownloadedAt: sql`now()`,
    } });
}
