import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ set: vi.fn(), del: vi.fn(), eval: vi.fn(), read: vi.fn(), email: vi.fn() }));
vi.mock("./activity", () => ({ ACTIVITY_PREFIX: "test", activityRedis: () => mocks, readActivity: mocks.read }));
vi.mock("../lib/email/resend", () => ({ sendEmail: mocks.email }));
import { sendApiActivityAlert } from "./activity-alerts";
const now = 1_800_000_000_000;
beforeEach(() => {
  vi.resetAllMocks(); mocks.set.mockResolvedValue("OK"); mocks.email.mockResolvedValue({ sent: true });
  mocks.read.mockResolvedValue({ lastEmail: null, signals: [{ at: now - 1000, kind: "rate-limited", endpoint: "snapshot", subject: "client:hashed", count: 60 }] });
});
it("sends a summary and records provider acceptance only after success", async () => {
  expect(await sendApiActivityAlert(now)).toEqual({ sent: true, signals: 1 });
  expect(mocks.email).toHaveBeenCalledOnce();
  expect(mocks.set).toHaveBeenCalledWith("test:last-email", now, { ex: 172800 });
  expect(mocks.eval).toHaveBeenCalledOnce();
});
it("prevents concurrent runs and respects successful-delivery cooldown", async () => {
  mocks.set.mockResolvedValueOnce(null);
  expect(await sendApiActivityAlert(now)).toEqual({ sent: false, reason: "busy" });
  mocks.read.mockResolvedValue({ lastEmail: now - 1000, signals: [] });
  expect(await sendApiActivityAlert(now)).toEqual({ sent: false, reason: "cooldown" });
  expect(mocks.email).not.toHaveBeenCalled();
});
it("keeps failed email eligible for retry and shows a generic delivery warning", async () => {
  mocks.email.mockResolvedValue({ sent: false, error: "provider details" });
  expect(await sendApiActivityAlert(now)).toEqual({ sent: false, reason: "delivery-failed" });
  expect(mocks.set.mock.calls.some(call => call[0] === "test:last-email")).toBe(false);
  expect(mocks.set.mock.calls.some(call => call[0] === "test:email-error")).toBe(true);
  expect(mocks.eval).toHaveBeenCalledOnce();
});
it("does not resend old signals", async () => {
  mocks.read.mockResolvedValue({ lastEmail: now - 7_200_000, signals: [{ at: now - 8_000_000 }] });
  expect(await sendApiActivityAlert(now)).toEqual({ sent: false, reason: "no-new-signals" });
  expect(mocks.email).not.toHaveBeenCalled();
});
