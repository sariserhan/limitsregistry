/**
 * One-off correction: LR-RAMSEY-5-5's upper-bound Claim (CLM-RAMSEY-5-5-UB, <= 48) reflected the
 * 2016 bound (McKay & Radziszowski). Angeltveit and McKay tightened it to <= 46 in 2024
 * (arXiv:2409.15709), confirmed as the current value in Radziszowski's dynamic survey "Small
 * Ramsey Numbers" (DS1, rev. 18, Apr 2026).
 *
 * Adds the tighter Claim rather than editing the old one — deriveFrontier already picks the
 * tighter of the two accepted upper bounds, and the site's own policy is to keep superseded
 * Claims visible as history rather than overwriting them. Reuses the real domain logic
 * (detectBreakthroughs) to confirm and record this as a STRONGER_BOUND event, matching exactly
 * what updateClaimEditorialStatus + detectAndRecordBreakthroughs would do — those live in
 * src/db/repository.ts, which imports "server-only" and can't run outside the Next.js server
 * runtime, so this script replicates their effects directly in SQL instead.
 */
import "dotenv/config";
import postgres from "postgres";
import { detectBreakthroughs } from "../src/domain/breakthrough";
import { deriveFrontier } from "../src/domain/frontier";
import type { Claim, SpecificationVersion } from "../src/domain/types";

const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

const ACTOR_USER_ID = "A8GN46izuJooJZRWVikPTrDxOqMRSveB"; // merge@example.com, SUPERADMIN
const NEW_UPPER_BOUND = "46";

function toExact(value: string) {
  return /^-?\d+$/.test(value) ? { kind: "integer" as const, value: BigInt(value) } : { kind: "text" as const, value };
}

async function main() {
  const [limit] = await sql`select id, direction, status, registry_number from limits where registry_number = 'LR-RAMSEY-5-5'`;
  const [spec] = await sql`select id from limit_spec_versions where limit_id = ${limit.id} order by version_number desc limit 1`;
  const existingClaims = await sql`select id, claim_number, claim_type, relation, value_exact, status from claims where specification_version_id = ${spec.id}`;

  // deriveFrontier/detectBreakthroughs only read specificationVersionId, status, relation, value,
  // and claimType — the rest of the Claim shape isn't needed for this one-off correction.
  const domainClaims = existingClaims.map((c) => ({
    id: c.id, specificationVersionId: spec.id, claimType: c.claim_type, relation: c.relation,
    value: toExact(c.value_exact), status: c.status,
  })) as unknown as Claim[];
  // deriveFrontier/detectBreakthroughs only ever read specification.id — the full
  // SpecificationVersion shape isn't needed here and this script has no cheap way to build it.
  const specForDomain = { id: spec.id } as SpecificationVersion;

  const [{ id: evidenceId }] = await sql`
    insert into evidence (type, label, url, metadata)
    values (${"PAPER"}, ${"Angeltveit & McKay — R(5,5) ≤ 46 (2024)"}, ${"https://arxiv.org/abs/2409.15709"}, ${sql.json({})})
    returning id
  `;

  const [newClaim] = await sql`
    insert into claims (claim_number, specification_version_id, claim_type, relation, value_exact, scope_parameters, epistemic_status, status, method_summary)
    values (
      ${"CLM-RAMSEY-5-5-UB-2024"}, ${spec.id}, ${"UPPER_BOUND"}, ${"<="}, ${NEW_UPPER_BOUND}, ${sql.json({})}, ${"PROVEN"}, ${"ACCEPTED"},
      ${"Angeltveit and McKay (2024) tightened the upper bound on R(5,5) from 48 (McKay & Radziszowski, 2016) to 46 via computer-assisted search, confirmed as the current value in Radziszowski's dynamic survey \"Small Ramsey Numbers\"."}
    )
    returning *
  `;
  await sql`insert into claim_evidence (claim_id, evidence_id) values (${newClaim.id}, ${evidenceId})`;

  // Mirrors detectBreakthroughs' own contract: compare the frontier without vs. with the newly
  // accepted claim added to the sibling set.
  const priorFrontier = deriveFrontier(limit.direction, specForDomain, domainClaims);
  const allClaims = [...domainClaims, { id: newClaim.id, specificationVersionId: spec.id, claimType: newClaim.claim_type, relation: newClaim.relation, value: toExact(newClaim.value_exact), status: newClaim.status } as unknown as Claim];
  const detections = detectBreakthroughs(limit.direction, specForDomain, allClaims, allClaims[allClaims.length - 1]);
  console.log("prior upper bound:", priorFrontier.upperBound, "-> detections:", JSON.stringify(detections));

  const now = new Date();
  for (const event of detections) {
    const [row] = await sql`insert into breakthrough_events (limit_id, claim_id, event_type, occurred_at) values (${limit.id}, ${newClaim.id}, ${event.eventType}, ${now}) returning id`;
    await sql`
      insert into watchlist_events (limit_id, event_type, source_entity_type, source_entity_id, payload, published_at)
      values (${limit.id}, ${event.eventType}, ${"BREAKTHROUGH_EVENT"}, ${row.id}, ${sql.json({ claimId: newClaim.id, detail: event.detail })}, ${now})
      on conflict do nothing
      returning id
    `;
  }

  const [{ id: watchlistEventId }] = await sql`
    insert into watchlist_events (limit_id, event_type, source_entity_type, source_entity_id, payload, published_at)
    values (${limit.id}, ${"CLAIM_ACCEPTED"}, ${"CLAIM"}, ${newClaim.id}, ${sql.json({ claimId: newClaim.id, claimNumber: newClaim.claim_number, registryNumber: limit.registry_number, title: `${newClaim.claim_number} accepted`, summary: `${newClaim.relation} ${newClaim.value_exact}`, url: `/limits/${limit.registry_number}` })}, ${now})
    on conflict do nothing
    returning id
  `;
  const subscribers = await sql`select id from follows where limit_id = ${limit.id} and enabled = true`;
  if (subscribers.length && watchlistEventId) {
    await sql`
      insert into notifications (follow_id, watchlist_event_id, event_type, payload)
      select f.id, ${watchlistEventId}, ${"CLAIM_ACCEPTED"}, ${sql.json({ claimId: newClaim.id })}
      from follows f where f.id in ${sql(subscribers.map((s) => s.id))}
      on conflict do nothing
    `;
  }
  console.log("subscribers notified:", subscribers.length);

  await sql`
    insert into audit_logs (actor_user_id, action, entity_type, entity_id, after, reason)
    values (${ACTOR_USER_ID}, ${"CLAIM_STATUS_ACCEPTED"}, ${"CLAIM"}, ${newClaim.id}, ${sql.json({ status: "ACCEPTED", relation: newClaim.relation, valueExact: newClaim.value_exact })}, ${"Registry data-accuracy correction: tightened R(5,5) upper bound to match current literature (Angeltveit & McKay, 2024)."})
  `;

  console.log("done. new claim:", newClaim.claim_number, newClaim.relation, newClaim.value_exact);
  await sql.end();
}
main();
