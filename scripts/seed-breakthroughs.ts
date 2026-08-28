import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");
const sql = postgres(url, { prepare: false });

const events = [
  ["LR-DRAFT-ALG-01", "STRONGER_BOUND", "2025-01-12", "Deterministic linear-time selection bound"],
  ["LR-DRAFT-ALG-02", "FRONTIER_CLOSED", "2025-02-08", "Linear-time planarity testing frontier"],
  ["LR-DRAFT-ALG-05", "FRONTIER_CLOSED", "2025-03-14", "Comparison-sorting lower-bound theorem"],
  ["LR-DRAFT-ALG-10", "STRONGER_BOUND", "2025-04-21", "Fast Fourier transform complexity bound"],
  ["LR-DRAFT-ALG-21", "FRONTIER_CLOSED", "2025-05-09", "Polynomial-time primality testing theorem"],
  ["LR-DRAFT-ALG-24", "STRONGER_BOUND", "2025-06-17", "Christofides approximation guarantee"],
  ["LR-DRAFT-MAT-01", "STRONGER_BOUND", "2025-07-03", "Carbon-nanotube tensile-strength measurement"],
  ["LR-DRAFT-MAT-02", "STRONGER_BOUND", "2025-08-19", "Suspended-graphene thermal-conductivity measurement"],
  ["LR-DRAFT-MAT-03", "STRONGER_BOUND", "2025-09-11", "MgB2 superconducting-transition measurement"],
  ["LR-DRAFT-BIO-01", "STRONGER_BOUND", "2025-10-06", "Minimal free-living bacterial genome record"],
  ["LR-DRAFT-BIO-10", "FRONTIER_CLOSED", "2025-11-18", "Minimal bacterial gene-set construction"],
  ["LR-DRAFT-BIO-29", "STRONGER_BOUND", "2025-12-04", "Large viral-genome record"],
] as const;

async function main() {
  let inserted = 0, skipped = 0;
  for (const [registryNumber, eventType, date, detail] of events) {
    const rows = await sql`select l.id as limit_id, c.id as claim_id from limits l join limit_spec_versions v on v.limit_id=l.id join claims c on c.specification_version_id=v.id where l.registry_number=${registryNumber} and l.status in ('OPEN','PROVEN') and c.status='ACCEPTED' order by c.created_at limit 1`;
    const record = rows[0];
    if (!record) throw new Error("No accepted Claim for " + registryNumber);
    const existing = await sql`select id from breakthrough_events where limit_id=${record.limit_id} and claim_id=${record.claim_id} and event_type=${eventType} limit 1`;
    if (existing.length) { skipped++; continue; }
    const created = await sql`insert into breakthrough_events (limit_id, claim_id, event_type, occurred_at) values (${record.limit_id},${record.claim_id},${eventType},${date + "T12:00:00Z"}) returning id`;
    const eventId = created[0].id;
    await sql`insert into watchlist_events (limit_id, event_type, source_entity_type, source_entity_id, payload, published_at) values (${record.limit_id},${eventType},'BREAKTHROUGH_EVENT',${eventId},${JSON.stringify({ claimId: record.claim_id, detail })}::jsonb,${date + "T12:00:00Z"})`;
    inserted++;
  }
  console.log(JSON.stringify({ inserted, skipped, requested: events.length }));
  await sql.end();
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
