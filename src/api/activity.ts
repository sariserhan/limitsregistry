import "server-only";
import { createHmac } from "node:crypto";
import { after } from "next/server";
import { Redis } from "@upstash/redis";
import { clientIp } from "../ops/client-ip";
import { hasDistributedRateLimit } from "../ops/rate-limit";

export type ApiEndpoint = "limits" | "record" | "categories" | "snapshot";
export type ActivityEvent = { endpoint: ApiEndpoint; status: number; method: "GET" | "HEAD"; keyId?: string; client?: string; at: number };
export type ApiSignal = { kind: string; endpoint: ApiEndpoint; subject: string; count: number; at: number };
export const ACTIVITY_PREFIX = "api-activity:v1";
export function activityRedis() { return hasDistributedRateLimit() ? Redis.fromEnv() : null; }
export function activitySecret() { return process.env.API_ACTIVITY_SECRET || process.env.CRON_SECRET || ""; }
export function anonymousClient(request: Request, at: number) {
  const secret = activitySecret();
  const ip = clientIp(request);
  if (secret.length < 32 || ip === "unknown") return undefined;
  return createHmac("sha256", secret).update(`${new Date(at).toISOString().slice(0, 10)}:${ip}`).digest("hex").slice(0, 24);
}

// One atomic operation: bounded hourly aggregates, expiring detection windows and
// a capped signal history. No paths, queries, tokens, raw addresses or user agents.
export const RECORD_ACTIVITY_SCRIPT = `
redis.call('HINCRBY', KEYS[1], ARGV[1], 1)
redis.call('EXPIRE', KEYS[1], 172800)
redis.call('SET', KEYS[7], ARGV[2], 'EX', 172800)
local function countWindow(key, field)
  local count = redis.call('HINCRBY', key, field, 1)
  redis.call('HSETNX', key, field .. ':first', ARGV[2])
  redis.call('EXPIRE', key, 900)
  local sustained = tonumber(ARGV[2]) - tonumber(redis.call('HGET', key, field .. ':first')) >= 60000
  return count, sustained
end
local total, sustained = countWindow(KEYS[2], 'total')
local previous = tonumber(redis.call('HGET', KEYS[3], 'total') or '0')
local kind = ''
local count = 0
if sustained and previous >= 100 and total >= 500 and total >= previous * 5 then
  kind = 'traffic-spike'; count = total
end
local status = tonumber(ARGV[3])
if status >= 500 then
  local errors, errorsSustained = countWindow(KEYS[2], 'errors')
  if errorsSustained and errors >= 20 then kind = 'server-errors'; count = errors end
end
if ARGV[4] ~= '' then
  local subjectCount, subjectSustained = countWindow(KEYS[4], ARGV[4])
  if subjectSustained and subjectCount >= tonumber(ARGV[5]) then
    kind = ARGV[4]; count = subjectCount
  end
end
if kind ~= '' then
  local subject = 'all'
  if kind == ARGV[4] then subject = ARGV[6] end
  local cooldown = kind .. ':' .. ARGV[7] .. ':' .. subject
  redis.call('ZREMRANGEBYSCORE', KEYS[5], '-inf', tonumber(ARGV[2])-3600000)
  local last = tonumber(redis.call('ZSCORE', KEYS[5], cooldown) or '0')
  if tonumber(ARGV[2]) - last >= 3600000 then
    -- Bound cooldown cardinality too: new subjects beyond 1000/hour share a cap.
    if last > 0 or redis.call('ZCARD', KEYS[5]) < 1000 then
      redis.call('ZADD', KEYS[5], ARGV[2], cooldown)
      redis.call('EXPIRE', KEYS[5], 7200)
      local event = cjson.encode({kind=kind,endpoint=ARGV[7],subject=subject,count=count,at=tonumber(ARGV[2])})
      redis.call('ZADD', KEYS[6], ARGV[2], event)
      redis.call('ZREMRANGEBYSCORE', KEYS[6], '-inf', tonumber(ARGV[2])-86400000)
      redis.call('ZREMRANGEBYRANK', KEYS[6], 0, -101)
      redis.call('EXPIRE', KEYS[6], 86400)
    end
  end
end
return total
`;

export async function recordActivity(event: ActivityEvent) {
  const redis = activityRedis();
  if (!redis) return;
  const hour = Math.floor(event.at / 3_600_000);
  const window = Math.floor(event.at / 300_000);
  const subject = event.keyId ? `key:${event.keyId}` : event.client ? `client:${event.client}` : "";
  let kind = "", threshold = 0;
  if (subject && event.status === 401) { kind = "invalid-credentials"; threshold = 30; }
  if (subject && event.status === 429) { kind = "rate-limited"; threshold = 60; }
  if (event.keyId && event.endpoint === "snapshot" && event.status === 200 && event.method === "GET") { kind = "frequent-downloads"; threshold = 60; }
  const p = ACTIVITY_PREFIX;
  await redis.eval(RECORD_ACTIVITY_SCRIPT, [
    `${p}:hour:${hour}`, `${p}:window:${window}:${event.endpoint}`, `${p}:window:${window - 1}:${event.endpoint}`,
    `${p}:subject:${window}:${event.endpoint}:${subject || "none"}`, `${p}:cooldowns`,
    `${p}:signals`, `${p}:last-recorded`,
  ], [`${event.endpoint}|${event.status}|${event.method}|${event.keyId || "anonymous"}`, event.at, event.status, kind, threshold, subject, event.endpoint]);
}

export async function observeApi(request: Request, endpoint: ApiEndpoint, handler: (context: { keyId?: string }) => Promise<Response>) {
  const context: { keyId?: string } = {};
  const at = Date.now();
  let status = 500;
  try {
    const response = await handler(context);
    status = response.status;
    return response;
  } finally {
    // Capture only the pseudonym before scheduling; don't retain Request/Authorization.
    const event: ActivityEvent = { endpoint, at, status, method: request.method === "HEAD" ? "HEAD" : "GET", keyId: context.keyId, client: anonymousClient(request, at) };
    try {
      after(async () => {
        try { await recordActivity(event); }
        catch { console.error("[api-activity] Recording failed; activity may be incomplete."); }
      });
    } catch { console.error("[api-activity] Could not schedule activity recording."); }
  }
}

export async function readActivity(now = Date.now()) {
  const redis = activityRedis();
  if (!redis) return null;
  const hours = Array.from({ length: 24 }, (_, i) => Math.floor(now / 3_600_000) - i);
  const pipeline = redis.pipeline();
  for (const hour of hours) pipeline.hgetall(`${ACTIVITY_PREFIX}:hour:${hour}`);
  pipeline.zrange(`${ACTIVITY_PREFIX}:signals`, now - 86_400_000, now, { byScore: true });
  pipeline.get(`${ACTIVITY_PREFIX}:last-recorded`);
  pipeline.get(`${ACTIVITY_PREFIX}:last-email`);
  pipeline.get(`${ACTIVITY_PREFIX}:email-error`);
  pipeline.get(`${ACTIVITY_PREFIX}:last-alert-check`);
  const results = await pipeline.exec();
  const rows = hours.flatMap((hour, i) => Object.entries((results[i] || {}) as Record<string, number>).map(([field, count]) => {
    const [endpoint, status, method, keyId] = field.split("|");
    return { hour, endpoint, status: Number(status), method, keyId, count: Number(count) };
  }));
  const signals = ((results[24] || []) as (ApiSignal | string)[]).map(value => typeof value === "string" ? JSON.parse(value) as ApiSignal : value).reverse();
  return { rows, signals, lastAlertCheck: Number(results[28]) || null, lastRecorded: Number(results[25]) || null, lastEmail: Number(results[26]) || null, emailError: results[27] ? String(results[27]) : null };
}
