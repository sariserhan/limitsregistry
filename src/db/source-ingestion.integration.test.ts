import { vi } from "vitest";
vi.mock("server-only", () => ({}));
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { claimNextSourceJob, enqueueSourceIngestion, failSourceJob } from "./repository.ingestion";
import { afterAll, describe, expect, it } from "vitest";
const url = process.env.INGESTION_TEST_DATABASE_URL ?? process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 2 }) : null;
afterAll(async () => { await sql?.end(); });

describe.skipIf(!sql)("source ingestion PostgreSQL integration", () => {
  it("persists lifecycle metrics and enforces source, state, and active-job constraints", async () => {
    const paperId=randomUUID(), first=randomUUID(), second=randomUUID();
    try {
      await sql!`insert into papers (id,title) values (${paperId},'Ingestion fixture')`;
      await expect(sql!`insert into source_ingestion_jobs (paper_id,requested_by_user_id,source_type,source_url,status) values (${paperId},'tester','ARXIV','http://arxiv.org/a.pdf','QUEUED')`).rejects.toMatchObject({code:"23514"});
      await expect(sql!`insert into source_ingestion_jobs (paper_id,requested_by_user_id,source_type,source_url,status) values (${paperId},'tester','ARXIV','https://arxiv.org/a.pdf','UNKNOWN')`).rejects.toMatchObject({code:"23514"});
      await sql!`insert into source_ingestion_jobs (id,paper_id,requested_by_user_id,source_type,source_url) values (${first},${paperId},'tester','ARXIV','https://arxiv.org/a.pdf')`;
      await expect(sql!`insert into source_ingestion_jobs (id,paper_id,requested_by_user_id,source_type,source_url) values (${second},${paperId},'tester','ARXIV','https://arxiv.org/b.pdf')`).rejects.toMatchObject({code:"23505"});
      const [claimed]=await sql!`update source_ingestion_jobs set status='PROCESSING',attempts=attempts+1,started_at=now() where id=${first} returning status,attempts`;
      expect(claimed).toMatchObject({status:"PROCESSING",attempts:1});
      await sql!`update source_ingestion_jobs set status='RETRY_WAIT',next_attempt_at=now(),error_code='TRANSIENT_FAILURE',error_message='temporary' where id=${first}`;
      const [retried]=await sql!`update source_ingestion_jobs set status='PROCESSING',attempts=attempts+1 where id=${first} returning attempts`;
      expect(retried.attempts).toBe(2);
      const [done]=await sql!`update source_ingestion_jobs set status='SUCCEEDED',page_count=12,byte_size=4096,extracted_character_count=22000,final_source_url='https://arxiv.org/a.pdf',completed_at=now() where id=${first} returning status,page_count,byte_size,extracted_character_count`;
      expect(done).toMatchObject({status:"SUCCEEDED",page_count:12,byte_size:4096,extracted_character_count:22000});
      await expect(sql!`update source_ingestion_jobs set page_count=0 where id=${first}`).rejects.toMatchObject({code:"23514"});
    } finally { await sql!`delete from source_ingestion_jobs where paper_id=${paperId}`; await sql!`delete from papers where id=${paperId}`; }
  });
  it("runs the repository enqueue, atomic claim, retry, and permanent-failure round trip", async () => {
    const paperId=randomUUID(); let jobId:string|undefined;
    try {
      await sql!`insert into papers (id,title,arxiv_id) values (${paperId}, 'Repository ingestion fixture', '2401.00001')`;
      const queued=await enqueueSourceIngestion({paperId,limitId:null,requestedByUserId:"tester",sourceUrl:"https://arxiv.org/pdf/2401.00001.pdf",sourceType:"ARXIV"}); jobId=queued.id;
      const claimed=await claimNextSourceJob(); expect(claimed?.id).toBe(jobId); expect(claimed?.attempts).toBe(1);
      const retry=await failSourceJob(jobId,new Error("temporary upstream failure"),new Date()); expect(retry?.status).toBe("RETRY_WAIT");
      await sql!`update source_ingestion_jobs set next_attempt_at=now()-interval '1 minute' where id=${jobId}`;
      const reclaimed=await claimNextSourceJob(); expect(reclaimed?.id).toBe(jobId); expect(reclaimed?.attempts).toBe(2);
      const failed=await failSourceJob(jobId,new Error("PDF exceeds the 15 MB download limit."),new Date());
      expect(failed?.status).toBe("FAILED"); expect(failed?.errorCode).toBe("SOURCE_REJECTED");
    } finally { await sql!`delete from source_ingestion_jobs where paper_id=${paperId}`; await sql!`delete from papers where id=${paperId}`; }
  });
});
