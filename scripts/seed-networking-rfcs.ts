/** Publishes exact, versioned protocol limits from authoritative IETF RFCs. */
import "dotenv/config";
import postgres from "postgres";
import { networkingRfcRecords } from "../src/catalog/networking-rfc";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });
let inserted = 0, skipped = 0;
async function main() {
  try {
    for (const record of networkingRfcRecords) {
      const existing = await sql`select registry_number,slug,title from limits where registry_number=${record.registryNumber} or slug=${record.slug} limit 1`;
      if (existing.length) {
        if (existing[0].registry_number !== record.registryNumber || existing[0].slug !== record.slug || existing[0].title !== record.title) throw new Error(`Catalog collision for ${record.registryNumber}/${record.slug}.`);
        skipped++; continue;
      }
      let [paper] = await sql`select id from papers where title=${`RFC ${record.rfc}: ${record.sourceTitle}`} limit 1`;
      if (!paper) [paper] = await sql`insert into papers (title,abstract,publication_date,venue,publisher_url) values (${`RFC ${record.rfc}: ${record.sourceTitle}`},${"The authoritative IETF specification used to define this versioned networking protocol limit."},${new Date(`${record.sourceDate}T00:00:00Z`)},${"Internet Engineering Task Force / RFC Editor"},${record.sourceUrl}) returning id`;
      await sql.begin(async (tx) => {
        const publishedAt = new Date(`${record.sourceDate}T00:00:00Z`);
        const [limit] = await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,unit,status,published_at) values (${record.registryNumber},${record.slug},${record.title},${record.summary},${"Networking"},${"IETF protocol specifications"},${record.direction},${record.metricName},${record.unit},${"PROVEN"},${publishedAt}) returning id`;
        const [specification] = await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${record.formalStatement},${tx.json(record.constraints as postgres.JSONValue)},${tx.json({kind:"STANDARD_DEFINED_LIMIT",authority:"IETF",rfc:record.rfc,sourceUrl:record.sourceUrl,versionSemantics:"Exact only within the cited RFC and stated constraints"})}) returning id`;
        const [claim] = await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,unit,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-RFC-${record.rfc}-${record.registryNumber.slice(3)}`},${specification.id},${"EXACT_VALUE"},${"="},${record.value},${`${record.value} ${record.unit}`},${record.unit},${tx.json({rfc:record.rfc,location:record.location})},${"PROVEN"},${"ACCEPTED"},${"The cited RFC normatively defines this value under the recorded constraints; it is a standards-defined exact value, not an empirical network measurement."}) returning id`;
        const [evidence] = await tx`insert into evidence (type,label,url,location,metadata) values (${"PAPER"},${`RFC ${record.rfc} — ${record.title}`},${record.sourceUrl},${record.location},${tx.json({authority:"IETF / RFC Editor",rfc:record.rfc,value:record.value,unit:record.unit,verificationLevel:"SOURCE_CONFIRMED"})}) returning id`;
        await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
        await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
        await tx`insert into timeline_events (limit_id,claim_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${claim.id},${"STANDARD_PUBLISHED"},${`RFC ${record.rfc} defines the protocol value`},${`${record.title}: ${record.value} ${record.unit}.`},${publishedAt},${tx.json({publicationState:"PUBLIC",source:record.sourceUrl,recordKind:"STANDARD_DEFINED_LIMIT"})})`;
        await tx`insert into audit_logs (action,entity_type,entity_id,before,after,reason) values (${"AUTHORITATIVE_STANDARD_CLAIM_ACCEPTED"},${"CLAIM"},${claim.id},${tx.json({status:"SOURCE_IMPORT"})},${tx.json({status:"ACCEPTED",epistemicStatus:"PROVEN",value:record.value,unit:record.unit})},${`Direct import from RFC ${record.rfc} with version and scope constraints.`}),(${"AUTHORITATIVE_STANDARD_LIMIT_PUBLISHED"},${"LIMIT"},${limit.id},${tx.json({status:"SOURCE_IMPORT"})},${tx.json({status:"PROVEN",publishedAt:publishedAt.toISOString()})},${`Exact protocol value defined by RFC ${record.rfc}.`})`;
      });
      inserted++;
    }
    const [counts] = await sql`select count(*) filter(where category='Networking' and status in ('OPEN','PROVEN','DISPUTED','RETIRED'))::int as "networkingCount",count(*) filter(where status in ('OPEN','PROVEN','DISPUTED','RETIRED'))::int as "publicCount" from limits`;
    console.log(JSON.stringify({inserted,skipped,catalogRecords:networkingRfcRecords.length,...counts}));
  } finally { await sql.end(); }
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
