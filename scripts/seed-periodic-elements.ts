/** Publishes exact atomic-number records for the first 75 elements from NIST's periodic table. */
import "dotenv/config";
import postgres from "postgres";
import { periodicElementRecords } from "../src/catalog/periodic-elements";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");
const sql = postgres(url, { prepare: false, max: 2 });
let inserted = 0; let skipped = 0;
async function main() {
  try {
    for (const record of periodicElementRecords) {
      const [existing] = await sql`select id from limits where lower(title) = lower(${record.title}) limit 1`;
      if (existing) { skipped++; continue; }
      let [paper] = await sql`select id from papers where title = ${"NIST Periodic Table of the Elements"} limit 1`;
      if (!paper) [paper] = await sql`insert into papers(title, abstract, publication_date, venue, publisher_url) values (${"NIST Periodic Table of the Elements"}, ${record.abstract}, ${new Date("2024-01-01T00:00:00Z")}, ${"National Institute of Standards and Technology"}, ${record.sourceUrl}) returning id`;
      const paperRow = paper;
      await sql.begin(async (tx) => {
        const [limit] = await tx`insert into limits(registry_number, slug, title, summary, category, subcategory, direction, metric_name, unit, status, published_at) values (${record.registryNumber}, ${record.slug}, ${record.title}, ${record.summary}, ${"Chemistry"}, ${"Periodic table / elements"}, ${"MAXIMIZE"}, ${"atomic number"}, ${"protons"}, ${"PROVEN"}, ${new Date("2024-01-01T00:00:00Z")}) returning id`;
        const [spec] = await tx`insert into limit_spec_versions(limit_id, version_number, formal_statement, constraints, assumptions) values (${limit.id}, 1, ${`Record the atomic number of ${record.title.replace(" atomic number", "")}.`}, ${tx.json({ definition: "number of protons", source: record.sourceUrl, exact: true })}, ${tx.json({ kind: "DEFINITIONAL_CONSTANT", sourceUrl: record.sourceUrl })}) returning id`;
        const [claim] = await tx`insert into claims(claim_number, specification_version_id, claim_type, relation, value_exact, value_text, unit, scope_parameters, epistemic_status, status, method_summary) values (${`CLM-ELEMENT-${String(record.atomicNumber).padStart(3, "0")}`}, ${spec.id}, ${"EXACT_VALUE"}, ${"="}, ${String(record.atomicNumber)}, ${String(record.atomicNumber)}, ${"protons"}, ${tx.json({ symbol: record.symbol, atomicNumber: record.atomicNumber })}, ${"PROVEN"}, ${"ACCEPTED"}, ${"The atomic number is the defining integer identity of an element."}) returning id`;
        const [evidence] = await tx`insert into evidence(type, label, url, location, metadata) values (${"PAPER"}, ${`${"NIST Periodic Table of the Elements"} — ${record.title}`}, ${record.sourceUrl}, ${`Element ${record.atomicNumber}`}, ${tx.json({ abstract: record.abstract, atomicNumber: record.atomicNumber, symbol: record.symbol, verificationLevel: "SOURCE_CONFIRMED", evidenceBasis: "DEFINITIONAL_REFERENCE" })}) returning id`;
        await tx`insert into claim_evidence(claim_id, evidence_id) values (${claim.id}, ${evidence.id})`;
        await tx`insert into claim_papers(claim_id, paper_id) values (${claim.id}, ${paperRow.id})`;
        await tx`insert into timeline_events(limit_id, claim_id, event_type, title, description, occurred_at, metadata) values (${limit.id}, ${claim.id}, ${"CHEMISTRY_ELEMENT_PUBLISHED"}, ${"Element identity published"}, ${record.summary}, ${new Date("2024-01-01T00:00:00Z")}, ${tx.json({ publicationState: "PUBLIC", source: record.sourceUrl, recordKind: "DEFINITIONAL_REFERENCE" })})`;
      });
      inserted++;
    }
    console.log(JSON.stringify({ inserted, skipped, catalogRecords: periodicElementRecords.length }));
  } finally { await sql.end(); }
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
