/** Publishes source-backed chemistry relations, constants, and model-qualified frontiers. */
import "dotenv/config";
import postgres from "postgres";
import { chemistryRecords } from "../src/catalog/chemistry";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");
const sql = postgres(url, { prepare: false, max: 2 });
let inserted = 0;
let skipped = 0;

async function main() {
  try {
    for (const record of chemistryRecords) {
      const [existing] = await sql`select id from limits where lower(title) = lower(${record.title}) limit 1`;
      if (existing) { await sql`update evidence set metadata = metadata || jsonb_build_object('abstract', ${record.summary}::text)::jsonb, updated_at = now() where label ilike ${"%" + record.title + "%"}`; skipped++; continue; }
      if ((await sql`select id from limits where registry_number = ${record.registryNumber} or slug = ${record.slug} limit 1`).length) throw new Error(`Catalog collision for ${record.registryNumber}/${record.slug}.`);
      let [paper] = await sql`select id from papers where doi = ${record.source.doi ?? null} or title = ${record.source.title} limit 1`;
      if (!paper) [paper] = await sql`insert into papers(title, abstract, publication_date, venue, doi, publisher_url) values (${record.source.title}, ${"Authoritative source for the registered chemistry relation or model-qualified value."}, ${new Date(`${record.source.date}T00:00:00Z`)}, ${record.source.venue}, ${record.source.doi ?? null}, ${record.source.url}) returning id`;
      await sql.begin(async (tx) => {
        const publishedAt = new Date(`${record.source.date}T00:00:00Z`);
        const [limit] = await tx`insert into limits(registry_number, slug, title, summary, category, subcategory, direction, metric_name, unit, status, published_at) values (${record.registryNumber}, ${record.slug}, ${record.title}, ${record.summary}, ${"Chemistry"}, ${record.subcategory}, ${record.direction}, ${record.metricName}, ${record.unit}, ${record.status}, ${publishedAt}) returning id`;
        const [spec] = await tx`insert into limit_spec_versions(limit_id, version_number, formal_statement, constraints, assumptions, asymptotic) values (${limit.id}, 1, ${record.formalStatement}, ${tx.json(record.constraints as postgres.JSONValue)}, ${tx.json({ kind: record.status === "PROVEN" ? "THEORETICAL_BOUND" : "MODEL_DEPENDENT_FRONTIER", certaintyOnClaim: record.status === "PROVEN", sourceUrl: record.source.url, interpretation: "Validity is restricted to the recorded chemical, thermodynamic, measurement, or SI model" })}, ${false}) returning id`;
        const [claim] = await tx`insert into claims(claim_number, specification_version_id, claim_type, relation, value_exact, value_text, unit, scope_parameters, epistemic_status, status, method_summary) values (${`CLM-CHEM-${record.registryNumber.slice(3)}`}, ${spec.id}, ${record.claimType}, ${record.relation}, ${record.formula}, ${record.formula}, ${record.unit}, ${tx.json({ sourceLocation: record.source.location, sourceDate: record.source.date })}, ${record.epistemic}, ${"ACCEPTED"}, ${record.status === "PROVEN" ? `The cited source establishes ${record.formula} under the recorded model.` : `The cited source supports ${record.formula} as a model-qualified chemistry relation.`}) returning id`;
        const [evidence] = await tx`insert into evidence(type, label, url, location, metadata) values (${"PAPER"}, ${`${record.source.title} — ${record.title}`}, ${record.source.url}, ${record.source.location}, ${tx.json({ abstract: record.summary, doi: record.source.doi ?? null, formula: record.formula, verificationLevel: record.status === "PROVEN" ? "SOURCE_CONFIRMED" : "REPORTED", evidenceBasis: record.evidenceBasis })}) returning id`;
        await tx`insert into claim_evidence(claim_id, evidence_id) values (${claim.id}, ${evidence.id})`;
        await tx`insert into claim_papers(claim_id, paper_id) values (${claim.id}, ${paper.id})`;
        await tx`insert into timeline_events(limit_id, claim_id, event_type, title, description, occurred_at, metadata) values (${limit.id}, ${claim.id}, ${"CHEMISTRY_RECORD_PUBLISHED"}, ${record.status === "PROVEN" ? "Chemistry relation established" : "Chemistry model frontier documented"}, ${record.summary}, ${publishedAt}, ${tx.json({ publicationState: "PUBLIC", source: record.source.url, recordKind: record.status === "PROVEN" ? "THEORETICAL_BOUND" : "MODEL_DEPENDENT_FRONTIER" })})`;
        await tx`insert into audit_logs(action, entity_type, entity_id, before, after, reason) values (${"AUTHORITATIVE_CHEMISTRY_CLAIM_ACCEPTED"}, ${"CLAIM"}, ${claim.id}, ${tx.json({ status: "SOURCE_IMPORT" })}, ${tx.json({ status: "ACCEPTED", relation: record.relation, formula: record.formula, epistemicStatus: record.epistemic })}, ${`Verified against ${record.source.title}; chemistry assumptions recorded.`}), (${"AUTHORITATIVE_CHEMISTRY_LIMIT_PUBLISHED"}, ${"LIMIT"}, ${limit.id}, ${tx.json({ status: "SOURCE_IMPORT" })}, ${tx.json({ status: record.status, publishedAt: publishedAt.toISOString() })}, ${"Published with explicit chemistry, measurement, and model assumptions."})`;
      });
      inserted++;
    }
    const [counts] = await sql`select count(*) filter (where category = 'Chemistry' and status in ('OPEN', 'PROVEN', 'DISPUTED', 'RETIRED'))::int as "categoryCount", count(*) filter (where status in ('OPEN', 'PROVEN', 'DISPUTED', 'RETIRED'))::int as "publicCount" from limits`;
    console.log(JSON.stringify({ inserted, skipped, catalogRecords: chemistryRecords.length, ...counts }));
  } finally { await sql.end(); }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
