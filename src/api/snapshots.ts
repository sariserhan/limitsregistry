import "server-only";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { get, put, del } from "@vercel/blob";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { apiSnapshots, auditLogs } from "../db/schema";
import { buildSnapshot } from "./build-snapshot";
import type { SnapshotFormat } from "./snapshot-format";

export function snapshotStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}
export async function currentSnapshot() {
  const [snapshot] = await db.select().from(apiSnapshots).where(eq(apiSnapshots.current, true)).limit(1);
  return snapshot ?? null;
}
export async function openSnapshot(path: string, signal: AbortSignal) {
  const result = await get(path, { access: "private", abortSignal: signal });
  return result?.statusCode === 200 ? result.stream : null;
}
export function snapshotPath(snapshot: typeof apiSnapshots.$inferSelect, format: SnapshotFormat) {
  return format === "json" ? snapshot.jsonPath : snapshot.ndjsonPath;
}

export async function publishSnapshot(actorUserId: string | null) {
  if (!snapshotStorageConfigured()) throw new Error("Private snapshot storage is not configured.");
  const directory = await mkdtemp(join(tmpdir(), "limits-snapshot-"));
  const uploaded: string[] = [];
  let committed = false;
  try {
    const built = await buildSnapshot(db, directory);
    const id = randomUUID();
    const jsonPath = `registry-snapshots/${id}/registry.json`;
    const ndjsonPath = `registry-snapshots/${id}/registry.ndjson`;
    for (const [path, file, contentType] of [[jsonPath, built.jsonFile, "application/json"], [ndjsonPath, built.ndjsonFile, "application/x-ndjson"]]) {
      const stream = createReadStream(file);
      try {
        const result = await put(path, stream, { access: "private", addRandomSuffix: false, contentType, multipart: true });
        uploaded.push(result.url);
      } finally { stream.destroy(); }
    }
    await db.transaction(async (tx) => {
      // Serialize the pointer swap; failed uploads never replace the current version.
      await tx.execute(sql`select pg_advisory_xact_lock(72419031)`);
      const [current] = await tx.select().from(apiSnapshots).where(eq(apiSnapshots.current, true));
      if (current && current.generatedAt > built.generatedAt) throw new Error("A newer snapshot was already published. Refresh the page.");
      await tx.update(apiSnapshots).set({ current: false }).where(eq(apiSnapshots.current, true));
      await tx.insert(apiSnapshots).values({ id, jsonPath, ndjsonPath, generatedAt: built.generatedAt,
        recordCount: built.recordCount, schemaVersion: built.schemaVersion, jsonHash: built.jsonHash,
        ndjsonHash: built.ndjsonHash, publishedByUserId: actorUserId, current: true });
      await tx.insert(auditLogs).values({ actorUserId, action: "API_SNAPSHOT_PUBLISHED", entityType: "API_SNAPSHOT", entityId: id,
        after: { recordCount: built.recordCount, revision: built.ndjsonHash } });
    });
    committed = true;
    return { recordCount: built.recordCount, revision: built.ndjsonHash };
  } finally {
    if (!committed && uploaded.length) await del(uploaded).catch(() => undefined);
    await rm(directory, { recursive: true, force: true });
  }
}
