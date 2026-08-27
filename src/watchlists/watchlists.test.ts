import { afterEach, describe, expect, it } from "vitest";
import { nextRetryAt, shouldRetry } from "./retry";
import { signUnsubscribe, verifyUnsubscribe } from "./security";
afterEach(() => { delete process.env.WATCHLIST_SECRET; });
describe("watchlist delivery safety", () => {
  it("signs scoped unsubscribe tokens and rejects tampering", () => { process.env.WATCHLIST_SECRET = "x".repeat(32); const token = signUnsubscribe("follow-1", "a@example.com"); expect(verifyUnsubscribe("follow-1", "a@example.com", token)).toBe(true); expect(verifyUnsubscribe("follow-2", "a@example.com", token)).toBe(false); });
  it("uses bounded exponential retry delays", () => { const now = new Date("2026-01-01T00:00:00Z"); expect(nextRetryAt(1, now).toISOString()).toBe("2026-01-01T00:05:00.000Z"); expect(nextRetryAt(4, now).toISOString()).toBe("2026-01-01T00:40:00.000Z"); expect(shouldRetry(4)).toBe(true); expect(shouldRetry(5)).toBe(false); });
  it("requires a strong unsubscribe secret", () => { process.env.WATCHLIST_SECRET = "short"; expect(() => signUnsubscribe("f", "a@example.com")).toThrow(/32 characters/); });
});
