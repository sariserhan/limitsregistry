/** Import researched domain packets as draft-only editorial records. Never publishes. */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { researchedDraftPackets, aiScalingResearchPackets } from "../src/domain/research-packets";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");
const sql = postgres(url);
const db = drizzle(sql, { schema });
const evidenceType = (type: string): "PAPER" | "EXPERIMENT" | "REPRODUCTION" | "OTHER" => type === "EXPERIMENT" || type === "OBSERVATION" ? "EXPERIMENT" : type === "REPRODUCTION" ? "REPRODUCTION" : type === "PAPER" ? "PAPER" : "OTHER";

async function run() {
  let imported = 0, updated = 0;
  for (const packet of [...researchedDraftPackets, ...aiScalingResearchPackets]) {
    const existing = await db.select({ id: schema.limits.id }).from(schema.limits).where(eq(schema.limits.registryNumber, packet.limit.id)).limit(1);
    if (existing[0]) {
      await db.update(schema.limits).set({ summary: packet.limit.summary, updatedAt: new Date() }).where(eq(schema.limits.id, existing[0].id));
      await db.update(schema.specificationVersions).set({ formalStatement: packet.specification.formalStatement, updatedAt: new Date() }).where(eq(schema.specificationVersions.limitId, existing[0].id));
      updated++;
      continue;
    }
    const [limit] = await db.insert(schema.limits).values({ registryNumber: packet.limit.id, slug: packet.limit.id.toLowerCase(), title: packet.limit.title, summary: packet.limit.summary, category: packet.limit.category, direction: packet.limit.direction, metricName: "specified quantity", status: "DRAFT" }).returning();
    if (!limit) throw new Error(`Could not create ${packet.limit.id}`);
    const [spec] = await db.insert(schema.specificationVersions).values({ limitId: limit.id, versionNumber: packet.specification.version, formalStatement: packet.specification.formalStatement, constraints: packet.specification.constraints, assumptions: {}, asymptotic: packet.specification.asymptotic, probabilistic: packet.specification.probabilistic }).returning();
    if (!spec) throw new Error(`Could not create specification for ${packet.limit.id}`);
    const evidenceRows = new Map<string, { id: string }>();
    for (const item of packet.evidence) {
      const [row] = await db.insert(schema.evidence).values({ type: evidenceType(item.type), label: item.label, url: item.sourceUrl ?? null, location: item.location ?? null, metadata: { method: item.method ?? null, verificationLevel: item.verificationLevel ?? null, attribution: item.attribution ?? null } }).returning({ id: schema.evidence.id });
      if (row) evidenceRows.set(item.id, row);
    }
    for (let index = 0; index < packet.claims.length; index++) {
      const claim = packet.claims[index];
      const [row] = await db.insert(schema.claims).values({ claimNumber: claim.id, specificationVersionId: spec.id, claimType: claim.claimType, relation: claim.relation, valueExact: claim.value.kind === "integer" ? claim.value.value.toString() : claim.value.kind === "rational" ? `${claim.value.numerator}/${claim.value.denominator}` : claim.value.value, valueNumeric: claim.value.kind === "integer" ? claim.value.value : null, valueText: claim.value.kind === "text" ? claim.value.value : null, scopeParameters: {}, epistemicStatus: "LITERATURE_ASSERTED", status: "DRAFT", methodSummary: claim.methodSummary ?? claim.source }).returning({ id: schema.claims.id });
      if (!row) continue;
      for (const evidenceId of claim.evidenceIds) { const ev = evidenceRows.get(evidenceId); if (ev) await db.insert(schema.claimEvidence).values({ claimId: row.id, evidenceId: ev.id }).onConflictDoNothing(); }
    }
    imported++;
    console.log(`seeded ${packet.limit.id} — ${packet.limit.title}`);
  }
  console.log(`done — ${imported} draft research records imported, ${updated} existing records updated.`);
  await sql.end();
}
run().catch((error) => { console.error(error); process.exit(1); });
