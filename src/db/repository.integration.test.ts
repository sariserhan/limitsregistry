import "dotenv/config";
import postgres from "postgres";
import { describe, expect, it } from "vitest";
describe("Docker PostgreSQL integration", () => {
  // CI provisions a real Postgres service and migrates it before `npm test` runs (see the
  // `postgres` service and `db:migrate` step in .github/workflows/ci.yml). If DATABASE_URL is
  // ever unset there again, skipIf would silently no-op this test on every PR instead of failing
  // — worse than no test, since it reads as coverage that isn't running. Only skip for a local
  // run without Docker up; fail loud if the same thing happens in CI.
  if (!process.env.DATABASE_URL && process.env.CI) {
    it("requires DATABASE_URL in CI", () => { throw new Error("DATABASE_URL is unset in CI — the Postgres integration test cannot run. Check the postgres service in .github/workflows/ci.yml."); });
    return;
  }
  it.skipIf(!process.env.DATABASE_URL)("can query the migrated registry schema", async () => { const sql = postgres(process.env.DATABASE_URL!); try { const result = await sql<{ count: string }[]>`select count(*)::text as count from information_schema.tables where table_schema = 'public' and table_name in ('limits','claims','evidence','reviews')`; expect(Number(result[0]?.count)).toBe(4); } finally { await sql.end(); } });
});
