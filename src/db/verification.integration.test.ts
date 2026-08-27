import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";
const url = process.env.VERIFICATION_TEST_DATABASE_URL ?? process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;
afterAll(async () => { await sql?.end(); });
describe.skipIf(!sql)("verification pipeline PostgreSQL integration", () => {
  it("guards MACHINE_CHECKED until an accepted artifact has a passed reproducible execution", async () => {
    const limitId = randomUUID(), specId = randomUUID(), claimId = randomUUID(), artifactId = randomUUID(), executionId = randomUUID();
    try {
      await sql!`insert into limits (id, registry_number, slug, title, summary, category, direction, metric_name, status) values (${limitId}, ${`LR-V-${limitId.slice(0, 8)}`}, ${`verification-${limitId}`}, 'Verification fixture', 'test', 'test', 'MINIMIZE', 'test', 'OPEN')`;
      await sql!`insert into limit_spec_versions (id, limit_id, version_number, formal_statement, constraints, assumptions) values (${specId}, ${limitId}, 1, 'test', ${sql!.json({})}, ${sql!.json({})})`;
      await sql!`insert into claims (id, claim_number, specification_version_id, claim_type, relation, value_exact, scope_parameters, epistemic_status, status) values (${claimId}, ${`CLM-V-${claimId.slice(0, 8)}`}, ${specId}, 'EXACT_VALUE', '=', '1', ${sql!.json({})}, 'FORMALLY_PROVEN', 'ACCEPTED')`;
      await sql!`insert into verification_artifacts (id, claim_id, verifier, repository_url, commit_hash) values (${artifactId}, ${claimId}, 'LEAN4', 'https://example.test/proof', ${"a".repeat(40)})`;
      await expect(sql!`update verification_artifacts set verification_level='MACHINE_CHECKED', build_result='PASSED' where id=${artifactId}`).rejects.toMatchObject({ code: "P0001" });
      await sql!`update verification_artifacts set review_status='ACCEPTED' where id=${artifactId}`;
      await expect(sql!`update verification_artifacts set verification_level='MACHINE_CHECKED', build_result='PASSED' where id=${artifactId}`).rejects.toMatchObject({ code: "P0001" });
      await sql!`insert into verifier_executions (id, artifact_id, verifier, command, tool_version, exit_code, status, reproducible, output_summary, output_digest, executed_by_user_id, started_at, completed_at) values (${executionId}, ${artifactId}, 'LEAN4', 'lake build', 'Lean 4.19', 0, 'PASSED', true, 'passed', ${"b".repeat(64)}, 'integration-test', now(), now())`;
      await sql!`update verification_artifacts set verification_level='MACHINE_CHECKED', build_result='PASSED' where id=${artifactId}`;
      const [artifact] = await sql!`select verification_level from verification_artifacts where id=${artifactId}`;
      expect(artifact.verification_level).toBe("MACHINE_CHECKED");
    } finally {
      await sql!`delete from verifier_executions where artifact_id=${artifactId}`; await sql!`delete from verification_artifacts where id=${artifactId}`; await sql!`delete from claims where id=${claimId}`; await sql!`delete from limit_spec_versions where id=${specId}`; await sql!`delete from limits where id=${limitId}`;
    }
  });
});
