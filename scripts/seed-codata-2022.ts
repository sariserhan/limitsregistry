/** Publishes 200 source-backed CODATA reference values with exact/measured semantics. */
import "dotenv/config";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { CODATA_CITATION_URL, CODATA_DRAFT_COUNT, CODATA_SOURCE_URL, codataRegistryNumber, codataSlug, parseCodataAscii } from "../src/catalog/codata";
const connectionString=process.env.DATABASE_URL;if(!connectionString)throw new Error("DATABASE_URL is required.");
const sql=postgres(connectionString,{prepare:false,max:2});
const rows=parseCodataAscii(readFileSync(new URL("../data/codata-2022.txt",import.meta.url),"utf8")).slice(0,CODATA_DRAFT_COUNT);
const paperTitle="CODATA Recommended Values of the Fundamental Physical Constants: 2022";
let inserted=0,updated=0;
async function main() {
try {
  let [paper]=await sql`select id from papers where title=${paperTitle} limit 1`;
  if(!paper){[paper]=await sql`insert into papers (title,abstract,publication_date,venue,publisher_url) values (${paperTitle},${"The 2022 self-consistent recommended values and conversion factors of physics and chemistry from the CODATA least-squares adjustment."},${new Date("2025-04-30T00:00:00Z")},${"Reviews of Modern Physics / NIST"},${CODATA_CITATION_URL}) returning id`;}
  for(let index=0;index<rows.length;index++){
    const item=rows[index],registryNumber=codataRegistryNumber(index),slug=codataSlug(item.quantity,index);
    // Every CODATA row is a single published reference value, not two opposing bounds — OPEN on
    // this Registry specifically means a real, unclosed gap between an achievable and an
    // impossibility frontier, which doesn't apply here regardless of whether the value itself is
    // SI-exact or an experimentally-determined figure with a stated uncertainty. Both cases
    // publish as PROVEN; the exact/measured distinction is carried by epistemic_status and
    // valueStatus instead, which the presentation layer (deriveFrontierPresentation) already
    // reads to correctly label an exact one "Exact defined value" vs "Recommended reference value".
    const exact=item.uncertainty==="(exact)",publicStatus="PROVEN",valueStatus=exact?"EXACT_BY_SI_DEFINITION":"EXPERIMENTALLY_DETERMINED";
    const exists=await sql`select id from limits where registry_number=${registryNumber} limit 1`;if(exists.length){await sql`update limits set subcategory=${"Reference values / CODATA 2022"},status=${publicStatus},published_at=${new Date("2025-04-30T00:00:00Z")},updated_at=now() where id=${exists[0].id}`;await sql`update claims set epistemic_status=${exact?"PROVEN":"SOURCE_CONFIRMED"},status=${"ACCEPTED"},updated_at=now() where specification_version_id in (select id from limit_spec_versions where limit_id=${exists[0].id})`;updated++;continue;}
    await sql.begin(async tx=>{
      const [limit]=await tx`insert into limits (registry_number,slug,title,summary,category,subcategory,direction,metric_name,unit,status) values (${registryNumber},${slug},${item.quantity},${`The 2022 CODATA recommended value of ${item.quantity}, retained with its published standard uncertainty.`},${"Physics"},${"Reference values / CODATA 2022"},${"MAXIMIZE"},${item.quantity},${item.unit||null},${publicStatus}) returning id`;
      const [spec]=await tx`insert into limit_spec_versions (limit_id,version_number,formal_statement,constraints,assumptions) values (${limit.id},1,${`Record the 2022 CODATA recommended value of ${item.quantity} in ${item.unit||"dimensionless form"}.`},${tx.json({adjustment:"2022 CODATA",uncertainty:item.uncertainty,source:CODATA_SOURCE_URL})},${tx.json({kind:"FUNDAMENTAL_CONSTANT",recordType:"REFERENCE_VALUE",valueStatus,registryReviewStatus:"SOURCE_ACCEPTED"})}) returning id`;
      const [claim]=await tx`insert into claims (claim_number,specification_version_id,claim_type,relation,value_exact,value_text,unit,scope_parameters,epistemic_status,status,method_summary) values (${`CLM-CODATA-${String(index+1).padStart(4,"0")}`},${spec.id},${"EXACT_VALUE"},${"="},${item.value},${`${item.value}${item.uncertainty==="(exact)"?" (exact)":` ± ${item.uncertainty}`}`},${item.unit||null},${tx.json({adjustment:"2022",uncertainty:item.uncertainty})},${exact?"PROVEN":"SOURCE_CONFIRMED"},${"ACCEPTED"},${exact?"CODATA 2022 exact reference value.":"CODATA 2022 experimentally determined reference value with published uncertainty."}) returning id`;
      const [evidence]=await tx`insert into evidence (type,label,url,location,metadata) values (${"PAPER"},${`${paperTitle} — ${item.quantity}`},${CODATA_SOURCE_URL},${"Complete Listing row"},${tx.json({quantity:item.quantity,value:item.value,uncertainty:item.uncertainty,unit:item.unit,sourceVersion:"2022 CODATA"})}) returning id`;
      await tx`insert into claim_evidence (claim_id,evidence_id) values (${claim.id},${evidence.id})`;
      await tx`insert into claim_papers (claim_id,paper_id) values (${claim.id},${paper.id})`;
      await tx`insert into timeline_events (limit_id,claim_id,event_type,title,description,occurred_at,metadata) values (${limit.id},${claim.id},${"SOURCE_RECOMMENDATION"},${"2022 CODATA recommended value"},${`${item.quantity}: ${item.value} ${item.unit}`},${new Date("2022-12-31T00:00:00Z")},${tx.json({publicationState:"PUBLIC",valueStatus,source:CODATA_SOURCE_URL})})`;
    }); inserted++;
  }
  const [{count}]=await sql`select count(*)::int as count from limits`;
  console.log(JSON.stringify({inserted,updated,totalLimits:count,source:CODATA_SOURCE_URL}));
} finally {await sql.end();}
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
