import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { claims, claimEvidence, evidence, limits, specificationVersions } from "../db/schema";
import { PUBLIC_LIMIT_STATUSES } from "../db/repository.public-limits";
import { serializeClaim, serializeEvidence, serializeSpecification } from "../db/serializers";
import { SNAPSHOT_SCHEMA_VERSION, snapshotJson } from "./snapshot-format";

// Build once, outside the download path. Repeatable read gives every page the same DB view.
// Write bounded batches to temp files, never collect the registry in memory.
export async function buildSnapshot(database: PostgresJsDatabase<typeof schema>, directory: string) {
  const jsonFile = join(directory, "registry.json"), ndjsonFile = join(directory, "registry.ndjson");
  const json = await open(jsonFile, "w");
  const ndjson = await open(ndjsonFile, "w");
  const jsonHash = createHash("sha256"), ndjsonHash = createHash("sha256");
  let recordCount = 0;
  const generatedAt = new Date();
  const writeJson = async (text: string) => { jsonHash.update(text); await json.writeFile(text); };
  try {
    await writeJson("[");
    await database.transaction(async (tx) => {
      let cursor = "";
      while (true) {
        const rows = await tx.select().from(limits).where(and(inArray(limits.status, PUBLIC_LIMIT_STATUSES), gt(limits.registryNumber, cursor)))
          .orderBy(asc(limits.registryNumber)).limit(100);
        if (!rows.length) break;
        const ids = rows.map((row) => row.id);
        const specs = await tx.selectDistinctOn([specificationVersions.limitId]).from(specificationVersions)
          .where(inArray(specificationVersions.limitId, ids)).orderBy(asc(specificationVersions.limitId), desc(specificationVersions.versionNumber));
        const accepted = specs.length ? await tx.select().from(claims)
          .where(and(inArray(claims.specificationVersionId, specs.map((spec) => spec.id)), eq(claims.status, "ACCEPTED"))).orderBy(asc(claims.claimNumber)) : [];
        const linked = accepted.length ? await tx.select({ claimId: claimEvidence.claimId, evidence }).from(claimEvidence)
          .innerJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(inArray(claimEvidence.claimId, accepted.map((claim) => claim.id)))
          .orderBy(asc(evidence.id)) : [];
        const direct = await tx.select().from(evidence).where(inArray(evidence.limitId, ids)).orderBy(asc(evidence.id));
        for (const limit of rows) {
          const spec = specs.find((item) => item.limitId === limit.id);
          const currentClaims = accepted.filter((claim) => claim.specificationVersionId === spec?.id);
          const claimIds = new Set(currentClaims.map((claim) => claim.id));
          const links = linked.filter((link) => claimIds.has(link.claimId));
          const citations = new Map(direct.filter((item) => item.limitId === limit.id).map((item) => [item.id, item]));
          for (const link of links) citations.set(link.evidence.id, link.evidence);
          const row = snapshotJson({
            schemaVersion: SNAPSHOT_SCHEMA_VERSION,
            registryNumber: limit.registryNumber, title: limit.title, summary: limit.summary,
            category: limit.category, subcategory: limit.subcategory, direction: limit.direction,
            metricName: limit.metricName, unit: limit.unit, status: limit.status, publishedAt: limit.publishedAt,
            url: `https://www.limitsregistry.com/limits/${limit.registryNumber}`,
            specification: spec ? serializeSpecification(spec) : null,
            claims: currentClaims.map((claim) => serializeClaim(claim, undefined, links.filter((link) => link.claimId === claim.id).map((link) => link.evidence.id))),
            evidence: [...citations.values()].sort((a, b) => a.id.localeCompare(b.id)).map(serializeEvidence),
          });
          await writeJson(`${recordCount ? "," : ""}${row}`);
          ndjsonHash.update(`${row}\n`);
          await ndjson.writeFile(`${row}\n`);
          recordCount += 1;
        }
        cursor = rows[rows.length - 1].registryNumber;
      }
    }, { isolationLevel: "repeatable read", accessMode: "read only" });
    await writeJson("]\n");
    return { jsonFile, ndjsonFile, generatedAt, recordCount, jsonHash: jsonHash.digest("hex"), ndjsonHash: ndjsonHash.digest("hex"), schemaVersion: SNAPSHOT_SCHEMA_VERSION };
  } finally {
    await Promise.all([json.close(), ndjson.close()]);
  }
}
