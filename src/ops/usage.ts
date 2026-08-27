import "server-only";
import { count } from "drizzle-orm";
import { db } from "../db/client";
import { limits, claims, papers, evidence, reviews, submissions, certificates, user } from "../db/schema";

export type UsageStat = { label: string; value: string; detail?: string };

const TABLES = [
  { label: "Limits", table: limits },
  { label: "Claims", table: claims },
  { label: "Papers", table: papers },
  { label: "Evidence", table: evidence },
  { label: "Reviews", table: reviews },
  { label: "Submissions", table: submissions },
  { label: "Certificates", table: certificates },
  { label: "Users", table: user },
] as const;

export async function getDatabaseUsage(): Promise<UsageStat[]> {
  const counts = await Promise.all(TABLES.map(({ table }) => db.select({ value: count() }).from(table)));
  return TABLES.map(({ label }, i) => ({ label, value: String(counts[i][0]?.value ?? 0) }));
}

export async function getUpstashUsage(): Promise<UsageStat> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return { label: "Upstash keys", value: "—", detail: "Not configured — add UPSTASH_REDIS_REST_URL/TOKEN" };
  try {
    const { Redis } = await import("@upstash/redis");
    const keys = await Redis.fromEnv().dbsize();
    return { label: "Upstash keys", value: String(keys) };
  } catch (error) {
    return { label: "Upstash keys", value: "—", detail: error instanceof Error ? error.message : "Could not reach Upstash" };
  }
}

// These have no usable data source today — no VERCEL_TOKEN for deployment/bandwidth usage,
// no Neon management token for storage/compute usage, and Resend's API doesn't expose send
// volume (only send + fetch-by-id). Reported honestly rather than fabricated.
export function getUnconfiguredUsage(): UsageStat[] {
  const rows: UsageStat[] = [];
  if (!process.env.AI_GATEWAY_API_KEY) rows.push({ label: "AI Gateway usage", value: "—", detail: "Not configured — add AI_GATEWAY_API_KEY" });
  rows.push({ label: "Vercel deployment usage", value: "—", detail: "Not configured — add a Vercel API token to enable" });
  rows.push({ label: "Neon storage/compute usage", value: "—", detail: "Not configured — add a Neon management API token to enable" });
  return rows;
}
