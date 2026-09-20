import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ save: vi.fn(), limit: vi.fn() }));
vi.mock("../db/repository.inbox", () => ({ createInboxMessage: mocks.save }));
vi.mock("../ops/rate-limit", () => ({ allowRequest: mocks.limit }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "spoofed, 192.0.2.15" }) }));
import { requestApiAccess } from "../../app/developers/request/actions";

function request() {
  const data = new FormData();
  Object.entries({ name: "Pilot Tester", email: "pilot@example.org", organization: "Research Lab", useCase: "Compare published scientific bounds across our research dataset.", volume: "One full snapshot weekly", freshness: "Monthly is sufficient" }).forEach(([key, value]) => data.set(key, value));
  return data;
}
beforeEach(() => { vi.resetAllMocks(); mocks.limit.mockResolvedValue(true); });
it("stores requirements in the private contact inbox with the existing shared allowance", async () => {
  expect(await requestApiAccess(request())).toEqual({ success: true });
  expect(mocks.limit).toHaveBeenCalledWith("inbox:CONTACT:192.0.2.15", 5, 3_600_000);
  expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ channel: "CONTACT", email: "pilot@example.org", subject: "API pilot request — Research Lab", message: expect.stringContaining("Monthly is sufficient") }));
});
it("rejects missing, invalid, and oversized requirements without writing", async () => {
  for (const [field, value] of [["email", "invalid"], ["useCase", "short"], ["volume", ""], ["organization", "x".repeat(201)]]) {
    const data = request(); data.set(field, value);
    expect((await requestApiAccess(data)).error).toBeTruthy();
  }
  expect(mocks.save).not.toHaveBeenCalled();
});
it("does not write when throttled or the limiter fails", async () => {
  mocks.limit.mockResolvedValue(false);
  expect((await requestApiAccess(request())).error).toMatch(/Too many/);
  mocks.limit.mockRejectedValue(new Error("offline"));
  expect((await requestApiAccess(request())).error).toMatch(/could not be saved/);
  expect(mocks.save).not.toHaveBeenCalled();
});
it("does not report success or expose internals when persistence fails", async () => {
  mocks.save.mockRejectedValue(new Error("private database details"));
  expect(await requestApiAccess(request())).toEqual({ error: "Your request could not be saved. Please try again shortly." });
});
