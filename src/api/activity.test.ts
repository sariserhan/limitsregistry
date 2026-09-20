import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ after: vi.fn(), eval: vi.fn(), configured: vi.fn() }));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@upstash/redis", () => ({ Redis: { fromEnv: () => ({ eval: mocks.eval }) } }));
vi.mock("../ops/rate-limit", () => ({ hasDistributedRateLimit: mocks.configured }));
import { anonymousClient, observeApi, recordActivity } from "./activity";
beforeEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); mocks.configured.mockReturnValue(true); });
it("rotates keyed client hashes daily and never falls back to unsalted IP hashes", () => {
  const request = new Request("https://example.test", { headers: { "x-forwarded-for": "spoofed, 192.0.2.1" } });
  expect(anonymousClient(request, 0)).toBeUndefined();
  vi.stubEnv("API_ACTIVITY_SECRET", "s".repeat(32));
  expect(anonymousClient(request, 0)).toHaveLength(24);
  expect(anonymousClient(request, 0)).toBe(anonymousClient(request, 1000));
  expect(anonymousClient(request, 0)).not.toBe(anonymousClient(request, 86_400_000));
  expect(anonymousClient(new Request("https://example.test"), 0)).toBeUndefined();
});
it("records status and resolved key after response without retaining credentials or query strings", async () => {
  vi.stubEnv("API_ACTIVITY_SECRET", "s".repeat(32));
  const response = new Response("original", { status: 429, headers: { "retry-after": "10" } });
  const request = new Request("https://example.test/api/v1/snapshot?secret=private", { headers: { authorization: "Bearer raw-secret-token", "x-forwarded-for": "192.0.2.1" } });
  expect(await observeApi(request, "snapshot", async context => { context.keyId = "key-id"; return response; })).toBe(response);
  expect(mocks.eval).not.toHaveBeenCalled();
  await mocks.after.mock.calls[0][0]();
  const stored = JSON.stringify(mocks.eval.mock.calls);
  expect(stored).toContain("key-id"); expect(stored).toContain("429");
  for (const secret of ["192.0.2.1", "raw-secret-token", "secret=private"]) expect(stored).not.toContain(secret);
});
it("preserves handler errors and observes them as 500", async () => {
  await expect(observeApi(new Request("https://example.test"), "limits", async () => { throw new Error("handler failed"); })).rejects.toThrow("handler failed");
  await mocks.after.mock.calls[0][0]();
  expect(mocks.eval.mock.calls[0][2][2]).toBe(500);
});
it("isolates storage and scheduling failures from API delivery", async () => {
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.eval.mockRejectedValue(new Error("private credentials"));
  await observeApi(new Request("https://example.test"), "categories", async () => new Response("ok"));
  await expect(mocks.after.mock.calls[0][0]()).resolves.toBeUndefined();
  mocks.after.mockImplementation(() => { throw new Error("no lifecycle"); });
  expect((await observeApi(new Request("https://example.test"), "categories", async () => new Response("ok"))).status).toBe(200);
  expect(JSON.stringify(errorLog.mock.calls)).not.toContain("private credentials");
  errorLog.mockRestore();
});
it("records successful downloads separately from conditional responses and HEAD", async () => {
  for (const [status, method, kind] of [[200, "GET", "frequent-downloads"], [304, "GET", ""], [405, "HEAD", ""]] as const) {
    await recordActivity({ endpoint: "snapshot", at: 1_800_000_000_000, keyId: "customer", status, method });
    expect(mocks.eval.mock.lastCall?.[2][3]).toBe(kind);
  }
});
