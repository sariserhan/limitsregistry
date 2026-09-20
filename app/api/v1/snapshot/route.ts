import { observeApi } from "../../../../src/api/activity";
import { API_V1_PAUSED, pausedApiResponse } from "../../../../src/api/v1-paused";
import { resolveApiKey, recordSnapshotDownload } from "../../../../src/api/api-key";
import { currentSnapshot, openSnapshot, snapshotPath, snapshotStorageConfigured } from "../../../../src/api/snapshots";
import { matchesEtag, PILOT_PER_MINUTE, snapshotFormat } from "../../../../src/api/snapshot-format";
import { checkRateLimit, hasDistributedRateLimit } from "../../../../src/ops/rate-limit";
import { clientIp } from "../../../../src/ops/client-ip";

export const runtime = "nodejs";
export const maxDuration = 60;
const privateHeaders = { "cache-control": "private, no-store", vary: "Authorization" };

async function getSnapshot(request: Request, context: { keyId?: string }) {
  const headers = new Headers(privateHeaders);
  const error = (status: number, code: string, message: string) => Response.json({ error: code, message, documentation: "/developers" }, { status, headers });
  if (API_V1_PAUSED) return pausedApiResponse();
  const format = snapshotFormat(request.url);
  if (!format) return error(400, "invalid_format", "Use format=json or format=ndjson.");
  if (!request.headers.has("authorization")) return error(402, "pilot_required", "Request a commercial pilot key to download snapshots. Public record endpoints remain free.");
  try {
    // Fail closed for paid downloads in production; a process-local counter is not a shared limit.
    if (process.env.NODE_ENV === "production" && !hasDistributedRateLimit()) return error(503, "temporarily_unavailable", "Snapshot downloads are temporarily unavailable.");
    const ipLimit = await checkRateLimit(`snapshot-ip:${clientIp(request)}`, 120);
    if (!ipLimit.allowed) {
      headers.set("retry-after", String(Math.max(1, Math.ceil((ipLimit.reset - Date.now()) / 1000))));
      return error(429, "rate_limited", "Too many snapshot requests. Retry later.");
    }
    const key = await resolveApiKey(request);
    if (!key) {
      headers.set("www-authenticate", 'Bearer realm="registry-snapshots"');
      return error(401, "invalid_api_key", "The API key is malformed, unknown, or revoked.");
    }
    context.keyId = key.id;
    const rate = await checkRateLimit(`snapshot-key:${key.id}`, PILOT_PER_MINUTE);
    headers.set("x-ratelimit-limit", String(PILOT_PER_MINUTE));
    headers.set("x-ratelimit-remaining", String(rate.remaining));
    if (!rate.allowed) {
      headers.set("retry-after", String(Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000))));
      return error(429, "rate_limited", "Too many snapshot requests. Retry later.");
    }
    if (!snapshotStorageConfigured()) return error(503, "snapshot_unavailable", "No snapshot is available yet.");
    const snapshot = await currentSnapshot();
    if (!snapshot) return error(503, "snapshot_unavailable", "No snapshot has been published yet.");
    const etag = `"${format === "json" ? snapshot.jsonHash : snapshot.ndjsonHash}"`;
    headers.set("etag", etag);
    headers.set("x-snapshot-revision", snapshot.ndjsonHash);
    headers.set("x-snapshot-generated-at", snapshot.generatedAt.toISOString());
    headers.set("x-snapshot-record-count", String(snapshot.recordCount));
    headers.set("x-snapshot-schema-version", String(snapshot.schemaVersion));
    if (matchesEtag(request.headers.get("if-none-match"), etag)) return new Response(null, { status: 304, headers });
    const stream = await openSnapshot(snapshotPath(snapshot, format), request.signal);
    if (!stream) return error(503, "snapshot_unavailable", "The snapshot file is temporarily unavailable.");
    try { await recordSnapshotDownload(key.id); }
    catch (failure) { await stream.cancel().catch(() => undefined); throw failure; }
    headers.set("content-type", format === "json" ? "application/json; charset=utf-8" : "application/x-ndjson; charset=utf-8");
    headers.set("content-disposition", `attachment; filename="limits-registry-${snapshot.ndjsonHash.slice(0, 12)}.${format}"`);
    return new Response(stream, { headers });
  } catch {
    return error(503, "temporarily_unavailable", "Snapshot downloads are temporarily unavailable. Please retry later.");
  }
}

// Next's implicit HEAD would call GET and count a download without delivering the file.
export async function HEAD(request: Request) {
  return observeApi(request, "snapshot", async () => new Response(null, { status: 405, headers: { ...privateHeaders, allow: "GET" } }));
}

export async function GET(request: Request) {
  return observeApi(request, "snapshot", (context) => getSnapshot(request, context));
}
