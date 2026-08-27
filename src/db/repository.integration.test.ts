import "dotenv/config";
import postgres from "postgres";
import { describe, expect, it } from "vitest";
describe("Docker PostgreSQL integration", () => { it.skipIf(!process.env.DATABASE_URL)("can query the migrated registry schema", async () => { const sql = postgres(process.env.DATABASE_URL!); try { const result = await sql<{ count: string }[]>`select count(*)::text as count from information_schema.tables where table_schema = 'public' and table_name in ('limits','claims','evidence','reviews')`; expect(Number(result[0]?.count)).toBe(4); } finally { await sql.end(); } }); });
