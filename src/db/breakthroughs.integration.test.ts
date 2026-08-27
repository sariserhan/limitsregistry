import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.BREAKTHROUGH_TEST_DATABASE_URL ?? process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;

afterAll(async () => { await sql?.end(); });

describe.skipIf(!sql)("breakthrough event PostgreSQL integration", () => {
  it("rolls back the immutable breakthrough record when the watchlist publication guard rejects it", async () => {
    const limitId = randomUUID(), specId = randomUUID(), claimId = randomUUID(), eventId = randomUUID();
    const registryNumber = `LR-K-${limitId.slice(0, 8)}`;
    const countRows = () => sql!`select
      (select count(*)::int from breakthrough_events where id = ${eventId}) as breakthrough,
      (select count(*)::int from watchlist_events where source_entity_type = 'BREAKTHROUGH_EVENT' and source_entity_id = ${eventId}) as watchlist`;

    try {
      await sql!`insert into limits (id,registry_number,slug,title,summary,category,direction,metric_name,status) values (${limitId},${registryNumber},${`breakthrough-${limitId}`},'Breakthrough fixture','test','test','MINIMIZE','test','DRAFT')`;
      await sql!`insert into limit_spec_versions (id,limit_id,version_number,formal_statement,constraints,assumptions) values (${specId},${limitId},1,'test',${sql!.json({})},${sql!.json({})})`;
      await sql!`insert into claims (id,claim_number,specification_version_id,claim_type,relation,value_exact,scope_parameters,epistemic_status,status) values (${claimId},${`CLM-K-${claimId.slice(0, 8)}`},${specId},'EXACT_VALUE','=','1',${sql!.json({})},'SOURCE_CONFIRMED','ACCEPTED')`;

      // The Limit is still DRAFT even though its Claim is ACCEPTED — mirrors the exact partial
      // state persistBreakthroughEvents' own transaction wrapping now protects against: without
      // it, a rejected watchlist_events insert would leave this breakthrough_events row orphaned
      // and publicly visible on the Limit's Timeline.
      const insertBoth = () => sql!.begin(async (tx) => {
        await tx`insert into breakthrough_events (id,limit_id,claim_id,event_type,occurred_at) values (${eventId},${limitId},${claimId},'STRONGER_BOUND',now())`;
        await tx`insert into watchlist_events (id,limit_id,event_type,source_entity_type,source_entity_id,payload,published_at) values (${randomUUID()},${limitId},'STRONGER_BOUND','BREAKTHROUGH_EVENT',${eventId},${sql!.json({ claimId })},now())`;
      });
      await expect(insertBoth()).rejects.toMatchObject({ code: "P0001" });
      expect(await countRows()).toEqual([{ breakthrough: 0, watchlist: 0 }]);

      await sql!`update limits set status='OPEN' where id=${limitId}`;
      await expect(insertBoth()).resolves.toBeUndefined();
      expect(await countRows()).toEqual([{ breakthrough: 1, watchlist: 1 }]);
    } finally {
      await sql!`delete from watchlist_events where source_entity_type='BREAKTHROUGH_EVENT' and source_entity_id=${eventId}`;
      await sql!`delete from breakthrough_events where id=${eventId}`;
      await sql!`delete from claims where id=${claimId}`;
      await sql!`delete from limit_spec_versions where id=${specId}`;
      await sql!`delete from limits where id=${limitId}`;
    }
  });
});
