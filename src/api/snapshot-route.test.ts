import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  resolveApiKey: vi.fn(), recordSnapshotDownload: vi.fn(), currentSnapshot: vi.fn(), openSnapshot: vi.fn(),
  snapshotStorageConfigured: vi.fn(), checkRateLimit: vi.fn(), hasDistributedRateLimit: vi.fn(), paused: false,
}));
vi.mock("./api-key", () => mocks);
vi.mock("./snapshots", () => ({ ...mocks, snapshotPath: (_snapshot: unknown, format: string) => `snapshot.${format}` }));
vi.mock("../ops/rate-limit", () => mocks);
vi.mock("./v1-paused", () => ({ get API_V1_PAUSED() { return mocks.paused; }, pausedApiResponse: () => Response.json({}, { status: 404 }) }));
import { GET, HEAD } from "../../app/api/v1/snapshot/route";

const request = (headers: Record<string, string> = {}, format = "ndjson") => new Request(`http://localhost/api/v1/snapshot?format=${format}`, { headers: { authorization: "Bearer test", ...headers } });
beforeEach(() => {
  vi.resetAllMocks(); mocks.paused = false;
  mocks.hasDistributedRateLimit.mockReturnValue(true);
  mocks.snapshotStorageConfigured.mockReturnValue(true);
  mocks.resolveApiKey.mockResolvedValue({ id: "key-id" });
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 29, reset: Date.now() + 60_000 });
  mocks.currentSnapshot.mockResolvedValue({ jsonHash: "json-hash", ndjsonHash: "ndjson-hash", generatedAt: new Date("2026-09-01T00:00:00Z"), schemaVersion: 1, recordCount: 1 });
  mocks.openSnapshot.mockImplementation(async () => new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{"registryNumber":"LR-1"}\n')); controller.close(); } }));
});

describe("paid snapshot delivery", () => {
  it("leaves anonymous requests outside the database", async () => {
    expect((await GET(new Request("http://localhost/api/v1/snapshot"))).status).toBe(402);
    expect(mocks.resolveApiKey).not.toHaveBeenCalled();
  });
  it("rejects unknown/revoked credentials without exposing storage", async () => {
    mocks.resolveApiKey.mockResolvedValue(null);
    const result = await GET(request());
    expect(result.status).toBe(401);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.currentSnapshot).not.toHaveBeenCalled();
  });
  it("streams a published artifact with private, versioned headers and counts once", async () => {
    const result = await GET(request());
    expect(result.status).toBe(200);
    expect(await result.text()).toContain('"registryNumber":"LR-1"');
    expect(result.headers.get("etag")).toBe('"ndjson-hash"');
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.get("x-snapshot-record-count")).toBe("1");
    expect(mocks.recordSnapshotDownload).toHaveBeenCalledExactlyOnceWith("key-id");
  });
  it("returns 304 before opening storage or recording usage, including weak/list validators", async () => {
    const result = await GET(request({ "if-none-match": '"old", W/"ndjson-hash"' }));
    expect(result.status).toBe(304);
    expect(await result.text()).toBe("");
    expect(mocks.openSnapshot).not.toHaveBeenCalled();
    expect(mocks.recordSnapshotDownload).not.toHaveBeenCalled();
  });
  it("does not reuse a validator between representations", async () => {
    const result = await GET(request({ "if-none-match": '"ndjson-hash"' }, "json"));
    expect(result.status).toBe(200);
    expect(result.headers.get("etag")).toBe('"json-hash"');
    expect(mocks.openSnapshot).toHaveBeenCalledWith("snapshot.json", expect.any(AbortSignal));
  });
  it("still authenticates a matching conditional request", async () => {
    mocks.resolveApiKey.mockResolvedValue(null);
    expect((await GET(request({ "if-none-match": "*" }))).status).toBe(401);
  });
  it("does not count storage failures or unavailable snapshots", async () => {
    mocks.openSnapshot.mockRejectedValue(new Error("storage secret must not leak"));
    const result = await GET(request());
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain("secret");
    expect(mocks.recordSnapshotDownload).not.toHaveBeenCalled();
  });
  it("cancels storage if accounting fails", async () => {
    const cancel = vi.fn();
    mocks.openSnapshot.mockResolvedValue(new ReadableStream({ cancel }));
    mocks.recordSnapshotDownload.mockRejectedValue(new Error("database failed"));
    expect((await GET(request())).status).toBe(503);
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("rate limits conditional requests without touching snapshot usage", async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({ allowed: true }).mockResolvedValueOnce({ allowed: false, remaining: 0, reset: Date.now() + 30_000 });
    const result = await GET(request({ "if-none-match": "*" }));
    expect(result.status).toBe(429);
    expect(Number(result.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(mocks.recordSnapshotDownload).not.toHaveBeenCalled();
  });
  it("honors the kill switch before authentication", async () => {
    mocks.paused = true;
    expect((await GET(request())).status).toBe(404);
    expect(mocks.resolveApiKey).not.toHaveBeenCalled();
  });
  it("rejects unsupported formats and HEAD without usage", async () => {
    expect((await GET(request({}, "csv"))).status).toBe(400);
    expect((await HEAD()).status).toBe(405);
    expect(mocks.recordSnapshotDownload).not.toHaveBeenCalled();
  });
});
