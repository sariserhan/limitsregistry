import { vi } from "vitest";
vi.mock("server-only",()=>({}));
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll,describe,expect,it } from "vitest";
import { publishReviewedCodataBatch,recordCodataBatchReview } from "./repository.codata-review";
const url=process.env.CODATA_REVIEW_TEST_DATABASE_URL;
const sql=url?postgres(url,{prepare:false,max:1}):null;
afterAll(async()=>{await sql?.end();});
describe.skipIf(!sql)("CODATA bulk editorial review integration",()=>{
  it("requires two distinct reviewers and publishes the complete batch atomically",async()=>{
    const reviewerA=randomUUID(),reviewerB=randomUUID(),editor=randomUUID();
    const userIds=[reviewerA,reviewerB,editor];
    try{
      // reviews.reviewer_user_id and audit_logs.actor_user_id are FK-constrained to user.id — these
      // three identities need real rows before recordCodataBatchReview/publishReviewedCodataBatch
      // can insert against them.
      await sql!`insert into "user" ${sql!(userIds.map((id)=>({id,name:`Fixture ${id.slice(0,8)}`,email:`${id}@codata-review-fixture.test`,email_verified:true,role:"EDITOR"})))}`;
      await expect(publishReviewedCodataBatch({actorUserId:editor,rationale:"Attempted publication before the required independent review threshold."})).rejects.toThrow("two independent");
      expect((await recordCodataBatchReview({reviewerUserId:reviewerA,rationale:"Inspected the frozen NIST source, quantities, values, uncertainties, units, and generated specifications."})).reviewed).toBe(200);
      await expect(recordCodataBatchReview({reviewerUserId:reviewerA,rationale:"A duplicate review by the same identity must not satisfy independent review requirements."})).rejects.toThrow("already reviewed");
      expect((await recordCodataBatchReview({reviewerUserId:reviewerB,rationale:"Independently checked the NIST CODATA 2022 source snapshot, parser output, units, and uncertainty metadata."})).reviewed).toBe(200);
      const reviewerCounts=await sql!`select reviewer_user_id,count(distinct claim_id)::int as claims from reviews where reviewer_user_id in ${sql!(userIds)} and decision='ACCEPTED' group by reviewer_user_id`;
      expect(reviewerCounts).toHaveLength(2);
      expect(reviewerCounts.every(({claims})=>claims===200)).toBe(true);
      const published=await publishReviewedCodataBatch({actorUserId:editor,rationale:"Two independent attributed reviews completed for every source-backed CODATA 2022 Claim."});
      expect(published).toEqual({published:200,alreadyPublished:false});
      const [counts]=await sql!`select count(*) filter(where l.status='PROVEN')::int as limits,count(*) filter(where c.status='ACCEPTED')::int as claims from limits l join limit_spec_versions s on s.limit_id=l.id join claims c on c.specification_version_id=s.id where l.registry_number like 'LR-001%'`;
      expect(counts).toEqual({limits:200,claims:200});
      await expect(publishReviewedCodataBatch({actorUserId:editor,rationale:"Idempotent publication confirmation after the complete reviewed batch was already published."})).resolves.toEqual({published:0,alreadyPublished:true});
    }finally{
      await sql!`delete from audit_logs where actor_user_id in ${sql!(userIds)}`;
      await sql!`delete from reviews where reviewer_user_id in ${sql!(userIds)}`;
      await sql!`delete from timeline_events where event_type='REGISTRY_PUBLICATION' and metadata->>'batch'='CODATA_2022'`;
      await sql!`update claims c set status='DRAFT' from limit_spec_versions s,limits l where c.specification_version_id=s.id and s.limit_id=l.id and l.registry_number like 'LR-001%'`;
      await sql!`update limits set status='DRAFT',published_at=null where registry_number like 'LR-001%'`;
      await sql!`delete from "user" where id in ${sql!(userIds)}`;
    }
  });
});
