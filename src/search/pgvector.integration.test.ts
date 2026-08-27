import { afterAll, describe, expect, it } from "vitest";
import postgres from "postgres";
const url = process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { max: 1 }) : null;
describe.skipIf(!sql)("pgvector semantic search integration", () => {
  afterAll(async () => { await sql?.end(); });
  it("has pgvector, the configured dimensions, and cosine relevance ordering", async () => {
    const extension = await sql!<{ extversion: string }[]>`select extversion from pg_extension where extname = 'vector'`;
    const type = await sql!<{ type: string }[]>`select format_type(a.atttypid,a.atttypmod) as type from pg_attribute a where a.attrelid='semantic_documents'::regclass and a.attname='embedding'`;
    const distance = await sql!<{ same: number; orthogonal: number }[]>`select '[1,0,0]'::vector(3) <=> '[1,0,0]'::vector(3) as same, '[1,0,0]'::vector(3) <=> '[0,1,0]'::vector(3) as orthogonal`;
    expect(extension[0]?.extversion).toBeTruthy(); expect(type[0]?.type).toBe("vector(1536)"); expect(Number(distance[0]?.same)).toBeLessThan(Number(distance[0]?.orthogonal));
  });
});
