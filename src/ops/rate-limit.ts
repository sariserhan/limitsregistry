import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const localWindows = new Map<string, { started: number; count: number }>();
let remoteLimiter: Ratelimit | null | undefined;

function getRemoteLimiter(limit: number) {
  if (remoteLimiter !== undefined) return remoteLimiter;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) { remoteLimiter = null; return remoteLimiter; }
  remoteLimiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(limit, "1 m"), prefix: "limits-registry" });
  return remoteLimiter;
}

export async function allowRequest(key: string, limit = 60, windowMs = 60_000) {
  const limiter = getRemoteLimiter(limit);
  if (limiter) return (await limiter.limit(key)).success;
  const now = Date.now(); const current = localWindows.get(key);
  if (!current || now - current.started >= windowMs) { localWindows.set(key, { started: now, count: 1 }); return true; }
  if (current.count >= limit) return false; current.count += 1; return true;
}
