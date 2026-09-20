import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const localWindows = new Map<string, { reset: number; count: number }>();
const remoteLimiters = new Map<string, Ratelimit>();

export function hasDistributedRateLimit() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1000) {
    throw new Error("Invalid rate limit configuration.");
  }
  const policy = `${limit}:${windowMs}`;
  if (hasDistributedRateLimit()) {
    let limiter = remoteLimiters.get(policy);
    if (!limiter) {
      limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`), prefix: `limits-registry:${policy}` });
      remoteLimiters.set(policy, limiter);
    }
    const result = await limiter.limit(key);
    // The SDK permits requests on timeout by default; paid access must fail closed.
    if (result.reason === "timeout") throw new Error("Rate limit service timed out.");
    return { allowed: result.success, remaining: result.remaining, reset: result.reset };
  }
  const now = Date.now();
  // Bound local memory; this fallback is per process, never a distributed guarantee.
  if (localWindows.size >= 10_000) {
    for (const [id, window] of localWindows) if (window.reset <= now) localWindows.delete(id);
  }
  const id = `${policy}:${key}`;
  let current = localWindows.get(id);
  if (!current || current.reset <= now) {
    if (localWindows.size >= 10_000 && !current) return { allowed: false, remaining: 0, reset: now + windowMs };
    current = { reset: now + windowMs, count: 0 };
    localWindows.set(id, current);
  }
  const allowed = current.count < limit;
  if (allowed) current.count += 1;
  return { allowed, remaining: Math.max(0, limit - current.count), reset: current.reset };
}

export async function allowRequest(key: string, limit = 60, windowMs = 60_000) {
  return (await checkRateLimit(key, limit, windowMs)).allowed;
}
