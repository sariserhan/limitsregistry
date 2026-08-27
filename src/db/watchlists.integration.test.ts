import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";
const url = process.env.WATCHLIST_TEST_DATABASE_URL ?? process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;
afterAll(async () => { await sql?.end(); });
describe.skipIf(!sql)("watchlist publication PostgreSQL integration", () => {
  it("rejects published events until the Claim is accepted and its Limit is public", async () => {
    const limitId=randomUUID(), specId=randomUUID(), claimId=randomUUID(), eventId=randomUUID();
    try {
      await sql!`insert into limits (id,registry_number,slug,title,summary,category,direction,metric_name,status) values (${limitId},${`LR-W-${limitId.slice(0,8)}`},${`watch-${limitId}`},'Watch fixture','test','test','MINIMIZE','test','DRAFT')`;
      await sql!`insert into limit_spec_versions (id,limit_id,version_number,formal_statement,constraints,assumptions) values (${specId},${limitId},1,'test',${sql!.json({})},${sql!.json({})})`;
      await sql!`insert into claims (id,claim_number,specification_version_id,claim_type,relation,value_exact,scope_parameters,epistemic_status,status) values (${claimId},${`CLM-W-${claimId.slice(0,8)}`},${specId},'EXACT_VALUE','=','1',${sql!.json({})},'SOURCE_CONFIRMED','DRAFT')`;
      const insertEvent = () => sql!`insert into watchlist_events (id,limit_id,event_type,source_entity_type,source_entity_id,payload,published_at) values (${eventId},${limitId},'CLAIM_ACCEPTED','CLAIM',${claimId},${sql!.json({ title: "accepted" })},now())`;
      await expect(insertEvent()).rejects.toMatchObject({ code: "P0001" });
      await sql!`update claims set status='ACCEPTED' where id=${claimId}`;
      await expect(insertEvent()).rejects.toMatchObject({ code: "P0001" });
      await sql!`update limits set status='OPEN' where id=${limitId}`;
      await expect(insertEvent()).resolves.toBeDefined();
    } finally { await sql!`delete from notifications where watchlist_event_id=${eventId}`; await sql!`delete from watchlist_events where id=${eventId}`; await sql!`delete from claims where id=${claimId}`; await sql!`delete from limit_spec_versions where id=${specId}`; await sql!`delete from limits where id=${limitId}`; }
  });
});
