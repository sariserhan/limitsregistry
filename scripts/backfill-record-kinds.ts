import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

async function main() { try {
  const updated = await sql.begin(async (tx) => {
    const rows = await tx`
      with latest_specs as (
        select distinct on (v.limit_id) v.id, v.limit_id, v.assumptions
        from limit_spec_versions v order by v.limit_id, v.version_number desc
      ), classified as (
        select s.id, s.assumptions,
          case
            when l.subcategory ilike '%Fundamental Constant%' then 'FUNDAMENTAL_CONSTANT'
            when l.subcategory ilike '%MIPLIB%' or l.category in ('Mathematics', 'Algorithms', 'Computing') then 'OPTIMIZATION'
            when exists (select 1 from claims c where c.specification_version_id=s.id and c.status='ACCEPTED' and c.claim_type='COUNTEREXAMPLE') then 'IMPOSSIBILITY_RESULT'
            when exists (select 1 from claims c join claim_evidence ce on ce.claim_id=c.id join evidence e on e.id=ce.evidence_id where c.specification_version_id=s.id and c.status='ACCEPTED' and e.type in ('EXPERIMENT','REPRODUCTION')) then 'OBSERVED_RECORD'
            else 'THEORETICAL_BOUND'
          end as kind
        from latest_specs s join limits l on l.id=s.limit_id
        where l.status in ('OPEN','PROVEN','DISPUTED','RETIRED') and coalesce(s.assumptions->>'kind','')=''
      )
      update limit_spec_versions v
      set assumptions=coalesce(v.assumptions,'{}'::jsonb)||jsonb_build_object('kind',c.kind), updated_at=now()
      from classified c where v.id=c.id
      returning v.id, c.assumptions as before_assumptions, v.assumptions as after_assumptions`;
    for (const row of rows) await tx`insert into audit_logs(action,entity_type,entity_id,before,after,reason) values('SPECIFICATION_KIND_BACKFILLED','SPECIFICATION_VERSION',${row.id},${tx.json({ assumptions: row.before_assumptions })},${tx.json({ assumptions: row.after_assumptions })},'Deterministic published-record presentation audit')`;
    return rows;
  });
  console.log(JSON.stringify({ updated: updated.length }));
} finally { await sql.end(); } }
void main().catch((error) => { console.error(error); process.exitCode = 1; });
