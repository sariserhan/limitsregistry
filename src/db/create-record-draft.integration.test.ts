import { vi } from "vitest";
vi.mock("server-only", () => ({}));
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";
import { createRecordDraft } from "./repository";
const url = process.env.CODATA_REVIEW_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;
afterAll(async () => { await sql?.end(); });
describe.skipIf(!sql)("createRecordDraft", () => {
  it("creates an atomic Limit/Spec/Claim/Evidence chain as DRAFT, deriving direction+relation from bound type", async () => {
    const [{ id: userId }] = await sql!`insert into "user" (id, name, email, email_verified, role) values (gen_random_uuid(), ${"Fixture"}, ${`fixture-${Date.now()}@create-record-draft.test`}, true, ${"EDITOR"}) returning id`;
    let limitId: string | undefined;
    try {
      const record = await createRecordDraft({
        title: "__TEST__ upper bound record", category: "__TEST_CATEGORY__",
        summary: "Test description, at least ten characters.",
        formalStatement: "Test abstract, at least ten characters long.",
        metricName: "Test metric", unit: "widgets",
        boundType: "UPPER_BOUND", valueExact: "42",
        evidenceUrl: "https://example.com/test", createdByUserId: userId,
      });
      limitId = record.limit.id;
      expect(record.limit.registryNumber).toMatch(/^LR-\d{6}$/);
      expect(record.limit.direction).toBe("MINIMIZE");
      expect(record.limit.status).toBe("DRAFT");
      expect(record.claim.relation).toBe("<=");
      expect(record.claim.status).toBe("DRAFT");

      const evidenceLinks = await sql!`select e.url from claim_evidence ce join evidence e on e.id = ce.evidence_id where ce.claim_id = ${record.claim.id}`;
      expect(evidenceLinks).toEqual([{ url: "https://example.com/test" }]);

      const lower = await createRecordDraft({
        title: "__TEST__ lower bound record", category: "__TEST_CATEGORY__",
        summary: "Test description, at least ten characters.",
        formalStatement: "Test abstract, at least ten characters long.",
        metricName: "Test metric", boundType: "LOWER_BOUND", valueExact: "7",
        createdByUserId: userId,
      });
      expect(lower.limit.direction).toBe("MAXIMIZE");
      expect(lower.claim.relation).toBe(">=");
      expect(lower.limit.registryNumber).not.toBe(record.limit.registryNumber);
      await sql!`delete from claims where id = ${lower.claim.id}`;
      await sql!`delete from limit_spec_versions where id = ${lower.spec.id}`;
      await sql!`delete from limits where id = ${lower.limit.id}`;
      await sql!`delete from audit_logs where entity_id = ${lower.limit.id}`;
    } finally {
      if (limitId) {
        await sql!`delete from claim_evidence where claim_id in (select c.id from claims c join limit_spec_versions s on s.id = c.specification_version_id where s.limit_id = ${limitId})`;
        await sql!`delete from evidence where limit_id = ${limitId}`;
        await sql!`delete from claims where specification_version_id in (select id from limit_spec_versions where limit_id = ${limitId})`;
        await sql!`delete from limit_spec_versions where limit_id = ${limitId}`;
        await sql!`delete from limits where id = ${limitId}`;
        await sql!`delete from audit_logs where entity_id = ${limitId}`;
      }
      await sql!`delete from "user" where id = ${userId}`;
    }
  });
});
