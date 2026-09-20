import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ role: vi.fn(), read: vi.fn(), keys: vi.fn() }));
vi.mock("../auth/session", () => ({ requireRole: mocks.role }));
vi.mock("./activity", () => ({ readActivity: mocks.read, activitySecret: () => "s".repeat(32) }));
vi.mock("./activity-alerts", () => ({ apiAlertRecipient: () => "owner@example.test" }));
vi.mock("../db/client", () => ({ db: { select: () => ({ from: mocks.keys }) } }));
vi.mock("../db/schema", () => ({ apiKeys: {} }));
import ApiActivityPage from "../../app/admin/api-activity/page";
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal("React", React); });
it("enforces ADMIN before reading customer or activity data", async () => {
  mocks.role.mockRejectedValue(new Error("Forbidden"));
  await expect(ApiActivityPage()).rejects.toThrow("Forbidden");
  expect(mocks.role).toHaveBeenCalledWith("ADMIN");
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.keys).not.toHaveBeenCalled();
});
it("distinguishes unavailable monitoring from zero usage", async () => {
  mocks.read.mockRejectedValue(new Error("private infrastructure"));
  const html = renderToStaticMarkup(await ApiActivityPage());
  expect(html).toContain("not evidence of zero traffic");
  expect(html).not.toContain("private infrastructure");
});
it("renders customer attribution, warnings and the cache coverage limitation", async () => {
  mocks.keys.mockResolvedValue([{ id: "key-id", prefix: "lr_live_prefix", organization: "Test Lab" }]);
  mocks.read.mockResolvedValue({ rows: [{ hour: 500000, endpoint: "snapshot", status: 429, method: "GET", keyId: "key-id", count: 60 }], signals: [{ at: 1_800_000_000_000, kind: "rate-limited", subject: "key:key-id", endpoint: "snapshot", count: 60 }], lastRecorded: 1_800_000_000_000, lastEmail: null, lastAlertCheck: null, emailError: "Alert email failed." });
  const html = renderToStaticMarkup(await ApiActivityPage());
  for (const value of ["Test Lab", "429", "rate-limited", "CDN cache hits", "Alert email failed.", "Last alert-job check"]) expect(html).toContain(value);
});
