/**
 * Publishes the 200 CODATA 2022 Claims/Limits directly (ACCEPTED / PROVEN), bypassing the
 * console's normal two-independent-reviewer gate (src/db/repository.codata-review.ts) —
 * explicit owner-requested override, not a real editorial review. Skips the `reviews` table
 * entirely and records an honest audit trail + timeline description instead of claiming
 * reviews that didn't happen.
 */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const CODATA_PATTERN = "LR-001%";
const EXPECTED_CODATA_RECORDS = 200;
const ACTOR_USER_ID = "A8GN46izuJooJZRWVikPTrDxOqMRSveB"; // merge@example.com, SUPERADMIN
const RATIONALE = "Administrative batch publication of the CODATA 2022 fundamental-constant catalog, sourced directly from NIST's official published values. Bypassed the normal two-independent-reviewer gate by explicit site-owner request.";

async function main() {
  const records = await sql`
    select c.id as claim_id, c.status as claim_status, l.id as limit_id, l.status as limit_status
    from claims c
    join limit_spec_versions v on v.id = c.specification_version_id
    join limits l on l.id = v.limit_id
    where l.registry_number like ${CODATA_PATTERN}
  `;
  if (records.length !== EXPECTED_CODATA_RECORDS) throw new Error(`Expected ${EXPECTED_CODATA_RECORDS} CODATA records, found ${records.length}.`);

  const already = records.filter((r) => r.claim_status === "ACCEPTED" && r.limit_status === "PROVEN");
  if (already.length === EXPECTED_CODATA_RECORDS) { console.log("Already fully published — no changes."); await sql.end(); return; }

  const claimIds = records.map((r) => r.claim_id);
  const limitIds = [...new Set(records.map((r) => r.limit_id))];
  const now = new Date();

  await sql.begin(async (tx) => {
    await tx`update claims set status = 'ACCEPTED', updated_at = ${now} where id = any(${claimIds})`;
    await tx`update limits set status = 'PROVEN', published_at = ${now}, updated_at = ${now} where id = any(${limitIds})`;
    for (const r of records) {
      await tx`
        insert into timeline_events (limit_id, claim_id, event_type, title, description, occurred_at, metadata)
        values (${r.limit_id}, ${r.claim_id}, 'REGISTRY_PUBLICATION', 'Published — CODATA 2022 batch import',
          ${RATIONALE}, ${now}, ${JSON.stringify({ batch: "CODATA_2022", adminOverride: true })}::jsonb)
      `;
    }
    await tx`
      insert into audit_logs (actor_user_id, action, entity_type, entity_id, before, after, reason)
      select ${ACTOR_USER_ID}, 'CODATA_BATCH_PUBLISHED_ADMIN_OVERRIDE', 'LIMIT', id::text, ${JSON.stringify({ status: "OPEN" })}::jsonb, ${JSON.stringify({ status: "PROVEN" })}::jsonb, ${RATIONALE}
      from limits where id = any(${limitIds})
    `;
  });

  console.log(`Published ${limitIds.length} Limits (${claimIds.length} Claims) as PROVEN, admin override.`);
  await sql.end();
}
main();
