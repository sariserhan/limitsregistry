import { describe, expect, it } from "vitest";
describe("PostgreSQL integration", () => { it.skipIf(!process.env.DATABASE_URL)("can query the configured database", async () => { const { getDatabaseHealth } = await import("./repository"); expect(await getDatabaseHealth()).toBe(true); }); });
