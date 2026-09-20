import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("./activity-alerts", () => ({ sendApiActivityAlert: mocks.send }));
import { GET } from "../../app/api/cron/api-activity/route";
beforeEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });
it("rejects unauthenticated cron calls before sending", async () => {
  expect((await GET(new Request("https://example.test"))).status).toBe(401);
  vi.stubEnv("CRON_SECRET", "test-secret");
  expect((await GET(new Request("https://example.test", { headers: { authorization: "Bearer incorrect" } }))).status).toBe(401);
  expect(mocks.send).not.toHaveBeenCalled();
});
it("returns a noncached result and hides infrastructure errors", async () => {
  vi.stubEnv("CRON_SECRET", "test-secret");
  const request = new Request("https://example.test", { headers: { authorization: "Bearer test-secret" } });
  mocks.send.mockResolvedValue({ sent: false, reason: "cooldown" });
  const response = await GET(request);
  expect(await response.json()).toEqual({ sent: false, reason: "cooldown" });
  expect(response.headers.get("cache-control")).toBe("no-store");
  mocks.send.mockRejectedValue(new Error("private connection details"));
  const failure = await GET(request);
  expect(failure.status).toBe(503);
  expect(await failure.text()).not.toContain("private connection details");
});
