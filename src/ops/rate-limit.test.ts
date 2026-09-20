import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const remote = vi.hoisted(() => ({ policies: [] as unknown[], calls: 0, timeout: false }));
vi.mock("@upstash/redis", () => ({ Redis: { fromEnv: () => ({}) } }));
vi.mock("@upstash/ratelimit", () => ({ Ratelimit: class {
  static slidingWindow(limit: number, window: string) { return { limit, window }; }
  constructor(options: unknown) { remote.policies.push(options); }
  async limit() { remote.calls++; return { success: true, remaining: 5, reset: 10, reason: remote.timeout ? "timeout" : undefined }; }
} }));
beforeEach(() => { vi.resetModules(); remote.policies = []; remote.calls = 0; remote.timeout = false; });
afterEach(() => vi.unstubAllEnvs());
describe("rate-limit policy isolation", () => {
  it("creates a different shared limiter for each limit/window and reuses matching policies", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.test"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test");
    const { checkRateLimit } = await import("./rate-limit");
    await checkRateLimit("a", 30); await checkRateLimit("b", 120); await checkRateLimit("c", 30); await checkRateLimit("d", 30, 120_000);
    expect(remote.policies).toHaveLength(3);
    expect(remote.policies[0]).toMatchObject({ limiter: { limit: 30, window: "60000 ms" } });
    expect(remote.policies[1]).toMatchObject({ limiter: { limit: 120, window: "60000 ms" } });
    expect(remote.policies[2]).toMatchObject({ limiter: { limit: 30, window: "120000 ms" } });
  });
  it("enforces and resets process-local windows without mixing policies", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    const { checkRateLimit } = await import("./rate-limit");
    const time = vi.spyOn(Date, "now").mockReturnValue(1000);
    try {
      expect((await checkRateLimit("test", 1, 1000)).allowed).toBe(true);
      expect((await checkRateLimit("test", 1, 1000)).allowed).toBe(false);
      expect((await checkRateLimit("test", 2, 1000)).remaining).toBe(1);
      time.mockReturnValue(2000);
      expect((await checkRateLimit("test", 1, 1000)).allowed).toBe(true);
    } finally { time.mockRestore(); }
  });
  it("fails closed when the SDK returns a successful timeout fallback", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.test"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test");
    remote.timeout = true;
    const { checkRateLimit } = await import("./rate-limit");
    await expect(checkRateLimit("paid")).rejects.toThrow("timed out");
  });

});
