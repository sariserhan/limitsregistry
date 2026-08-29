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

// Unchanged from before: a presence check only, not a real fetch — the AI Gateway spend-report
// response shape isn't confirmed, and showing a guessed number would be worse than showing
// nothing. Not part of what was reported broken; left exactly as originally scoped.
export function getAiGatewayConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

// Deployment count/state over the REST API — Vercel doesn't expose a simple documented
// bandwidth/billing-usage endpoint for a personal API token (that data lives behind the `vercel
// usage` CLI command / dashboard), so this reports real deployment activity instead of guessing
// at an undocumented usage figure. VERCEL_PROJECT_ID/VERCEL_ORG_ID are Vercel's own System
// Environment Variables, auto-injected at runtime when the project exposes them (already relied
// on elsewhere via VERCEL_ENV) — no separate configuration needed beyond the token itself.
export async function getVercelUsage(): Promise<UsageStat> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { label: "Vercel deployment usage", value: "—", detail: "Not configured — add a Vercel API token to enable" };
  try {
    const params = new URLSearchParams({ limit: "10" });
    if (process.env.VERCEL_PROJECT_ID) params.set("projectId", process.env.VERCEL_PROJECT_ID);
    if (process.env.VERCEL_ORG_ID) params.set("teamId", process.env.VERCEL_ORG_ID);
    const response = await fetch(`https://api.vercel.com/v6/deployments?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Vercel API returned ${response.status}`);
    const data = await response.json();
    const deployments: Array<{ readyState?: string; state?: string }> = data.deployments ?? [];
    const readyCount = deployments.filter((d) => (d.readyState ?? d.state) === "READY").length;
    return { label: "Vercel deployment usage", value: String(deployments.length), detail: `${readyCount} ready of last ${deployments.length} deployments` };
  } catch (error) {
    return { label: "Vercel deployment usage", value: "—", detail: error instanceof Error ? error.message : "Could not reach Vercel" };
  }
}

const NEON_NOT_CONFIGURED = "Not configured — add a Neon management API token to enable";

function neonAuthReady() {
  const token = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID;
  return token && projectId ? { token, projectId } : null;
}

// Branch count + total logical storage size over the Neon API. Neon's usage-based consumption
// endpoint (matching invoice line items) requires a paid plan tier; branch logical_size is
// available on every tier, so this is what actually works regardless of plan.
export async function getNeonStorageUsage(): Promise<UsageStat> {
  const auth = neonAuthReady();
  if (!auth) return { label: "Neon storage", value: "—", detail: NEON_NOT_CONFIGURED };
  try {
    const response = await fetch(`https://console.neon.tech/api/v2/projects/${auth.projectId}/branches`, { headers: { Authorization: `Bearer ${auth.token}`, Accept: "application/json" } });
    if (!response.ok) throw new Error(`Neon API returned ${response.status}`);
    const data = await response.json();
    const branches: Array<{ logical_size?: number }> = data.branches ?? [];
    const totalMB = branches.reduce((sum, branch) => sum + (branch.logical_size ?? 0), 0) / (1024 * 1024);
    return { label: "Neon storage", value: `${totalMB.toFixed(1)} MB`, detail: `${branches.length} branch${branches.length === 1 ? "" : "es"}` };
  } catch (error) {
    return { label: "Neon storage", value: "—", detail: error instanceof Error ? error.message : "Could not reach Neon" };
  }
}

// Compute endpoint state + provisioned autoscaling range over the Neon API — genuinely distinct
// from storage: this reflects whether compute is currently running (billable) or suspended
// (scale-to-zero), and how large it's allowed to scale, not how much data is stored.
export async function getNeonComputeUsage(): Promise<UsageStat> {
  const auth = neonAuthReady();
  if (!auth) return { label: "Neon compute", value: "—", detail: NEON_NOT_CONFIGURED };
  try {
    const response = await fetch(`https://console.neon.tech/api/v2/projects/${auth.projectId}/endpoints`, { headers: { Authorization: `Bearer ${auth.token}`, Accept: "application/json" } });
    if (!response.ok) throw new Error(`Neon API returned ${response.status}`);
    const data = await response.json();
    const endpoints: Array<{ current_state?: string; autoscaling_limit_min_cu?: number; autoscaling_limit_max_cu?: number }> = data.endpoints ?? [];
    if (!endpoints.length) return { label: "Neon compute", value: "0", detail: "No compute endpoints found" };
    const activeCount = endpoints.filter((e) => e.current_state === "active").length;
    const primary = endpoints[0];
    const range = primary.autoscaling_limit_min_cu !== undefined && primary.autoscaling_limit_max_cu !== undefined ? `${primary.autoscaling_limit_min_cu}–${primary.autoscaling_limit_max_cu} CU` : "range unknown";
    return { label: "Neon compute", value: `${activeCount}/${endpoints.length} active`, detail: `${range}${endpoints.length > 1 ? ` (${endpoints.length} endpoints)` : ""}` };
  } catch (error) {
    return { label: "Neon compute", value: "—", detail: error instanceof Error ? error.message : "Could not reach Neon" };
  }
}
