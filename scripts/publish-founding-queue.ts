/** Publishes the complete evidence-backed founding review queue without fabricating reviewer identities. */
import "dotenv/config";
import postgres from "postgres";

const connectionString=process.env.DATABASE_URL;if(!connectionString)throw new Error("DATABASE_URL is required.");
const sql=postgres(connectionString,{prepare:false,max:2});
const proven=new Set(["LR-DRAFT-C","LR-DRAFT-CARNOT","LR-DRAFT-COVERING","LR-DRAFT-E8","LR-DRAFT-KISSING4","LR-DRAFT-NO-CLONING","LR-DRAFT-RAMSEY33","LR-DRAFT-ALG-01","LR-DRAFT-ALG-02","LR-DRAFT-ALG-03","LR-DRAFT-ALG-05","LR-DRAFT-ALG-10","LR-DRAFT-ALG-21"]);

async function main(){try{
  // Scoped to the LR-DRAFT-* research packets (src/domain/research-packets.ts) only — this is the
  // "founding queue" the docstring means. The LR-000200 range is the launch-catalog's deliberately
  // evidence-free placeholders, and the LR-001xxx CODATA batch has its own dedicated two-independent-
  // reviewer publish path (recordCodataBatchReview/publishReviewedCodataBatch); sweeping either of
  // those into a blanket status flip here would bypass that review gate or publish a stub with no
  // real evidence.
  const candidates=await sql`select l.id,l.registry_number,l.status,count(c.id)::int claim_count,count(ce.evidence_id)::int evidence_count from limits l join limit_spec_versions v on v.limit_id=l.id join claims c on c.specification_version_id=v.id left join claim_evidence ce on ce.claim_id=c.id where (l.status=${"DRAFT"} and l.registry_number like ${"LR-DRAFT-%"}) or l.registry_number in ${sql([...proven])} group by l.id,l.registry_number,l.status order by l.registry_number`;
  const queue=candidates.filter(row=>row.claim_count>0&&row.evidence_count>=row.claim_count);
  const skipped=candidates.filter(row=>!(row.claim_count>0&&row.evidence_count>=row.claim_count));
  if(skipped.length)console.log(JSON.stringify({skipped:skipped.map(row=>row.registry_number)}));
  await sql.begin(async tx=>{for(const row of queue){const nextStatus=proven.has(row.registry_number)?"PROVEN":"OPEN";const claimEpistemic=nextStatus==="PROVEN"?"PROVEN":"SOURCE_CONFIRMED";const claimRows=await tx`select c.id,c.status from claims c join limit_spec_versions v on v.id=c.specification_version_id where v.limit_id=${row.id} and c.status in (${"DRAFT"},${"UNDER_REVIEW"})`;await tx`update claims set status=${"ACCEPTED"},epistemic_status=${claimEpistemic},updated_at=now() where id in ${tx(claimRows.map(claim=>claim.id))}`;await tx`update limits set status=${nextStatus},published_at=coalesce(published_at,now()),updated_at=now() where id=${row.id}`;for(const claim of claimRows)await tx`insert into audit_logs (action,entity_type,entity_id,before,after,reason) values (${"ADMIN_SOURCE_PUBLICATION_ACCEPTED"},${"CLAIM"},${claim.id},${tx.json({status:claim.status})},${tx.json({status:"ACCEPTED",epistemicStatus:claimEpistemic})},${"Evidence-backed founding queue publication; no reviewer identity asserted"})`;await tx`insert into audit_logs (action,entity_type,entity_id,before,after,reason) values (${"ADMIN_SOURCE_PUBLICATION_PUBLISHED"},${"LIMIT"},${row.id},${tx.json({status:row.status})},${tx.json({status:nextStatus,publishedAt:new Date().toISOString()})},${"Evidence-backed founding queue publication; exact records closed and all other records kept open"})`;}});
  console.log(JSON.stringify({published:queue.length,proven:queue.filter(row=>proven.has(row.registry_number)).length,open:queue.filter(row=>!proven.has(row.registry_number)).length}));
}finally{await sql.end()}}
void main().catch(error=>{console.error(error);process.exitCode=1});
