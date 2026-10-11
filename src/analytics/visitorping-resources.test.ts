import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ after: vi.fn(), checkRateLimit: vi.fn(), hasDistributedRateLimit: vi.fn() }));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("../ops/rate-limit", () => mocks);
beforeEach(() => {
  vi.resetModules(); vi.resetAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals();
  vi.stubEnv("VERCEL_ENV", "production"); vi.stubEnv("VISITORPING_RESOURCE_REPORTING_ENABLED", "true");
  vi.stubEnv("VISITORPING_RESOURCE_MERCHANT_TOKEN", "vp_agent_" + "a".repeat(43));
  mocks.hasDistributedRateLimit.mockReturnValue(true); mocks.checkRateLimit.mockResolvedValue({ allowed: true });
});
it("reports measured byte/statement counts after delivery without SQL, content, or request data", async () => {
  const send = vi.fn(async () => Response.json({ id: "recorded" })); vi.stubGlobal("fetch", send);
  const { observeResources } = await import("./visitorping-resources");
  const { countResourceQuery } = await import("./resource-context");
  const response = await observeResources(async () => {
    countResourceQuery("select 'private-value'"); countResourceQuery("update secret_table set value='private'");
    return Response.json({ content: "private €" });
  });
  const text = await response.text(); expect(send).not.toHaveBeenCalled();
  await mocks.after.mock.calls[0][0]();
  const init = (send.mock.calls[0] as unknown as [string, RequestInit])[1];
  const data = JSON.parse(String(init.body));
  expect(data.units).toEqual({ apiCalls: 1, databaseReads: 1, databaseWrites: 1, bandwidthBytes: Buffer.byteLength(text) });
  expect(String(init.body)).not.toMatch(/private|secret_table|computeMs/);
  expect(data.externalId).toMatch(/^limitsregistry_api_/);
  expect(init.redirect).toBe("error");
});
it("omits database counts for unclassified SQL and never substitutes wall time for CPU", async () => {
  const send = vi.fn(async () => Response.json({})); vi.stubGlobal("fetch", send);
  const { observeResources } = await import("./visitorping-resources");
  const { countResourceQuery } = await import("./resource-context");
  await observeResources(async () => { countResourceQuery("with x as (select 1) select * from x"); return Response.json({ ok: true }); });
  await mocks.after.mock.calls[0][0]();
  const body = JSON.parse(String((send.mock.calls[0] as unknown as [string, RequestInit])[1].body));
  expect(body.units.databaseReads).toBeUndefined(); expect(body.units.computeMs).toBeUndefined();
});
it("fails closed on the shared budget, skips preview and preserves handler errors", async () => {
  const send = vi.fn(); vi.stubGlobal("fetch", send);
  const { observeResources } = await import("./visitorping-resources");
  vi.stubEnv("VERCEL_ENV", "preview"); const error = new Error("original failure");
  await expect(observeResources(async () => { throw error; })).rejects.toBe(error);
  expect(mocks.after).not.toHaveBeenCalled();
  vi.stubEnv("VERCEL_ENV", "production"); mocks.checkRateLimit.mockResolvedValue({ allowed: false });
  await observeResources(async () => Response.json({ ok: true })); await mocks.after.mock.calls[0][0]();
  expect(send).not.toHaveBeenCalled(); expect(mocks.checkRateLimit).toHaveBeenCalledWith("visitorping-resources",900,86400000);
});
it("bounds body measurement and preserves the original body", async () => {
  const { boundedResponseBytes } = await import("./visitorping-resources");
  const response = Response.json({ value: "a".repeat(270000) });
  expect(await boundedResponseBytes(response)).toBeUndefined(); expect((await response.json()).value.length).toBe(270000);
  expect(await boundedResponseBytes(new Response("stream", { headers: { "content-type": "text/event-stream" } }))).toBeUndefined();
});
it("isolates counters across simultaneous request contexts", async () => {
  const { resourceContext, countResourceQuery } = await import("./resource-context");
  const first = { reads: 0, writes: 0, unknown: false }, second = { ...first };
  await Promise.all([
    resourceContext.run(first, async () => { await Promise.resolve(); countResourceQuery("select 1"); }),
    resourceContext.run(second, async () => { countResourceQuery("insert into example values(1)"); await Promise.resolve(); }),
  ]);
  expect(first).toEqual({ reads: 1, writes: 0, unknown: false }); expect(second).toEqual({ reads: 0, writes: 1, unknown: false });
});
it("does not fail delivery or leak credentials when reporting fails", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("private credential"); }));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const { observeResources } = await import("./visitorping-resources");
  const response = await observeResources(async () => Response.json({ ok: true })); expect(response.status).toBe(200);
  await expect(mocks.after.mock.calls[0][0]()).resolves.toBeUndefined(); expect(JSON.stringify(log.mock.calls)).not.toContain("private credential");
  log.mockRestore();
});
