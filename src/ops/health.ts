import "server-only";
import { getDatabaseHealth } from "../db/repository";

export type HealthStatus = "ok" | "degraded" | "not_configured";
export type HealthCheck = { name: string; status: HealthStatus; detail: string };

async function checkWebsite(): Promise<HealthCheck> {
  return { name: "Website", status: "ok", detail: `Rendering normally · process up ${Math.round(process.uptime())}s` };
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    const healthy = await getDatabaseHealth();
    return healthy ? { name: "Database", status: "ok", detail: "Postgres reachable" } : { name: "Database", status: "degraded", detail: "Query returned an unexpected result" };
  } catch (error) {
    return { name: "Database", status: "degraded", detail: error instanceof Error ? error.message : "Connection failed" };
  }
}

async function checkUpstash(): Promise<HealthCheck> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { name: "Upstash Redis", status: "not_configured", detail: "Not configured — rate limiting falls back to in-memory" };
  }
  try {
    const { Redis } = await import("@upstash/redis");
    const pong = await Redis.fromEnv().ping();
    return pong === "PONG" ? { name: "Upstash Redis", status: "ok", detail: "Reachable" } : { name: "Upstash Redis", status: "degraded", detail: `Unexpected ping response: ${pong}` };
  } catch (error) {
    return { name: "Upstash Redis", status: "degraded", detail: error instanceof Error ? error.message : "Ping failed" };
  }
}

async function checkResend(): Promise<HealthCheck> {
  // Resend API keys are commonly scoped to "sending access" only — this app only ever calls
  // emails.send(), so a domains.list() probe would report "degraded" for a key that is actually
  // fully operational for its real use case, just lacking an unrelated read permission. Rather
  // than send a real test email to validate reachability, report presence honestly instead.
  if (!process.env.RESEND_API_KEY) return { name: "Resend", status: "not_configured", detail: "Not configured — emails are skipped" };
  return { name: "Resend", status: "ok", detail: "API key present (sending isn't probed here to avoid sending a real test email)" };
}

async function checkAiGateway(): Promise<HealthCheck> {
  if (!process.env.AI_GATEWAY_API_KEY) return { name: "AI Gateway", status: "not_configured", detail: "Not configured — Research Console AI extraction is unavailable" };
  return { name: "AI Gateway", status: "ok", detail: "API key present" };
}

// Public, unauthenticated status page — reflects Vercel's platform overall, not this specific
// project's deployment (no VERCEL_TOKEN is configured to query project-specific data).
async function checkVercel(): Promise<HealthCheck> {
  try {
    const response = await fetch("https://www.vercel-status.com/api/v2/status.json", { cache: "no-store" });
    if (!response.ok) return { name: "Vercel (platform status)", status: "degraded", detail: `Status page returned ${response.status}` };
    const data = (await response.json()) as { status?: { indicator?: string; description?: string } };
    const indicator = data.status?.indicator ?? "unknown";
    return { name: "Vercel (platform status)", status: indicator === "none" ? "ok" : "degraded", detail: data.status?.description ?? indicator };
  } catch (error) {
    return { name: "Vercel (platform status)", status: "degraded", detail: error instanceof Error ? error.message : "Could not reach status page" };
  }
}

export async function runHealthChecks(): Promise<HealthCheck[]> {
  return Promise.all([checkWebsite(), checkDatabase(), checkUpstash(), checkResend(), checkAiGateway(), checkVercel()]);
}
