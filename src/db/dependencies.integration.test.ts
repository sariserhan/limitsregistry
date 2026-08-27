import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";
const url = process.env.DEPENDENCY_TEST_DATABASE_URL ?? process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;
afterAll(async () => { await sql?.end(); });
describe.skipIf(!sql)("dependency graph PostgreSQL integration", () => {
  it("enforces direction constraints and accepted-only public isolation", async () => {
    const source = randomUUID(), target = randomUUID(), edge = randomUUID();
    try {
      await sql!`insert into limits (id, registry_number, slug, title, summary, category, direction, metric_name, status) values (${source}, ${`LR-T-${source.slice(0, 8)}`}, ${`test-${source}`}, 'Source', 'test', 'test', 'MINIMIZE', 'test', 'OPEN'), (${target}, ${`LR-T-${target.slice(0, 8)}`}, ${`test-${target}`}, 'Target', 'test', 'test', 'MINIMIZE', 'test', 'OPEN')`;
      await expect(sql!`insert into limit_dependencies (source_limit_id, target_limit_id, relation) values (${source}, ${source}, 'REDUCES_TO')`).rejects.toMatchObject({ code: "23514" });
      await expect(sql!`insert into limit_dependencies (source_limit_id, target_limit_id, relation) values (${source}, ${target}, 'RELATED_TO')`).rejects.toMatchObject({ code: "23514" });
      await sql!`insert into limit_dependencies (id, source_limit_id, target_limit_id, relation, review_status) values (${edge}, ${source}, ${target}, 'REDUCES_TO', 'DRAFT')`;
      expect((await sql!`select id from limit_dependencies where id = ${edge} and review_status = 'ACCEPTED'`).length).toBe(0);
      await sql!`update limit_dependencies set review_status = 'ACCEPTED' where id = ${edge}`;
      expect((await sql!`select id from limit_dependencies where id = ${edge} and review_status = 'ACCEPTED'`).length).toBe(1);
    } finally {
      await sql!`delete from limit_dependencies where source_limit_id in (${source}, ${target}) or target_limit_id in (${source}, ${target})`;
      await sql!`delete from limits where id in (${source}, ${target})`;
    }
  });
});
