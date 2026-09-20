import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { newApiKey } from "./key-token";

vi.mock("server-only", () => ({}));
const storage = vi.hoisted(() => ({ put: vi.fn(), del: vi.fn(), get: vi.fn() }));
vi.mock("@vercel/blob", () => storage);
// An explicit disposable DB is required. Never fall back to a developer's production DATABASE_URL.
const url = process.env.PILOT_TEST_DATABASE_URL;
const client = url ? postgres(url, { max: 5, prepare: false }) : null;
const database = client ? drizzle(client, { schema }) : null;
vi.mock("../db/client", () => ({ get db() { return database; } }));
afterAll(async () => { await client?.end(); });

describe.skipIf(!client)("commercial pilot PostgreSQL integration", () => {
  it("enforces credential invariants, accounts concurrent downloads, and revokes immediately", async () => {
    const { plaintext, ...credential } = newApiKey();
    const [key] = await database!.insert(schema.apiKeys).values({ ...credential, organizationName: "Pilot test", contactEmail: "pilot@example.test" }).returning();
    try {
      await expect(database!.update(schema.apiKeys).set({ status: "REVOKED" }).where(eq(schema.apiKeys.id, key.id))).rejects.toThrow();
      await expect(database!.update(schema.apiKeys).set({ tier: "FREE" }).where(eq(schema.apiKeys.id, key.id))).rejects.toThrow();
      await expect(database!.update(schema.apiKeys).set({ contactEmail: "bad" }).where(eq(schema.apiKeys.id, key.id))).rejects.toThrow();
      const { resolveApiKey, recordSnapshotDownload } = await import("./api-key");
      const request = new Request("http://localhost", { headers: { authorization: `Bearer ${plaintext}` } });
      expect(await resolveApiKey(request)).toEqual({ id: key.id });
      await Promise.all(Array.from({ length: 20 }, () => recordSnapshotDownload(key.id)));
      const [usage] = await database!.select().from(schema.apiUsageDaily).where(eq(schema.apiUsageDaily.keyId, key.id));
      expect(usage.downloads).toBe(20);
      expect(usage.day).toBe(new Date().toISOString().slice(0, 10));
      await database!.update(schema.apiKeys).set({ status: "REVOKED", revokedAt: new Date() }).where(eq(schema.apiKeys.id, key.id));
      expect(await resolveApiKey(request)).toBeNull();
      expect(JSON.stringify(key)).not.toContain(plaintext);
    } finally { await database!.delete(schema.apiKeys).where(eq(schema.apiKeys.id, key.id)); }
  });

  it("builds complete, deterministic artifacts with current accepted claims and changes hashes on unlink", async () => {
    const prefix = `LR-PILOT-${randomUUID()}`;
    const directory = await mkdtemp(join(tmpdir(), "pilot-test-"));
    const ids = Array.from({ length: 102 }, () => randomUUID());
    const oldSpec = randomUUID(), currentSpec = randomUUID();
    const accepted = randomUUID(), draft = randomUUID(), oldClaim = randomUUID();
    const citation = randomUUID(), hiddenCitation = randomUUID();
    try {
      await database!.insert(schema.limits).values(ids.map((id, index) => ({ id, registryNumber: `${prefix}-${String(index).padStart(3, "0")}`,
        slug: `pilot-${id}`, title: `Test ${index}`, summary: "Pilot test", category: "test", direction: "MINIMIZE" as const, metricName: "test", status: index === 101 ? "DRAFT" as const : "OPEN" as const })));
      await database!.insert(schema.specificationVersions).values([
        { id: oldSpec, limitId: ids[0], versionNumber: 1, formalStatement: "old", constraints: {}, assumptions: {} },
        { id: currentSpec, limitId: ids[0], versionNumber: 2, formalStatement: "current", constraints: {}, assumptions: {} },
      ]);
      await database!.insert(schema.claims).values([
        { id: accepted, claimNumber: `CLM-${accepted}`, specificationVersionId: currentSpec, claimType: "EXACT_VALUE", relation: "=", valueExact: "999999999999999999999999", scopeParameters: {}, epistemicStatus: "PROVEN", status: "ACCEPTED" },
        { id: draft, claimNumber: `CLM-${draft}`, specificationVersionId: currentSpec, claimType: "EXACT_VALUE", relation: "=", valueExact: "1", scopeParameters: {}, epistemicStatus: "PROVEN", status: "DRAFT" },
        { id: oldClaim, claimNumber: `CLM-${oldClaim}`, specificationVersionId: oldSpec, claimType: "EXACT_VALUE", relation: "=", valueExact: "2", scopeParameters: {}, epistemicStatus: "PROVEN", status: "ACCEPTED" },
      ]);
      await database!.insert(schema.evidence).values([
        { id: citation, type: "PAPER", label: "Published citation", url: "https://example.test/paper", metadata: {} },
        { id: hiddenCitation, type: "PAPER", label: "Draft-only citation", url: "https://example.test/draft", metadata: {} },
      ]);
      await database!.insert(schema.claimEvidence).values([{ claimId: accepted, evidenceId: citation }, { claimId: draft, evidenceId: hiddenCitation }]);
      const { buildSnapshot } = await import("./build-snapshot");
      const first = await buildSnapshot(database!, directory);
      const json = JSON.parse(await readFile(first.jsonFile, "utf8"));
      const ndjson = (await readFile(first.ndjsonFile, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
      expect(json).toEqual(ndjson);
      expect(first.recordCount).toBe(json.length);
      expect(json.filter((record: { registryNumber: string }) => record.registryNumber.startsWith(prefix))).toHaveLength(101);
      const record = json.find((item: { registryNumber: string }) => item.registryNumber === `${prefix}-000`);
      expect(record.specification.version).toBe(2);
      expect(record.claims).toHaveLength(1);
      expect(record.claims[0].value.value).toBe("999999999999999999999999");
      expect(record.evidence.map((item: { id: string }) => item.id)).toEqual([citation]);
      const repeat = await buildSnapshot(database!, directory);
      expect(repeat.jsonHash).toBe(first.jsonHash);
      expect(repeat.ndjsonHash).toBe(first.ndjsonHash);
      await database!.delete(schema.claimEvidence).where(eq(schema.claimEvidence.claimId, accepted));
      const unlinked = await buildSnapshot(database!, directory);
      expect(unlinked.ndjsonHash).not.toBe(first.ndjsonHash);
    } finally {
      await client!`delete from claim_evidence where claim_id in (${accepted}, ${draft}, ${oldClaim})`;
      await client!`delete from claims where id in (${accepted}, ${draft}, ${oldClaim})`;
      await client!`delete from evidence where id in (${citation}, ${hiddenCitation})`;
      await client!`delete from limit_spec_versions where id in (${oldSpec}, ${currentSpec})`;
      await client!`delete from limits where id in ${client!(ids)}`;
      await rm(directory, { recursive: true, force: true });
    }
  });
  it("publishes both artifacts before switching the manifest and preserves it on upload failure", async () => {
    const actor = `pilot-admin-${randomUUID()}`;
    const previous = await database!.select().from(schema.apiSnapshots).where(eq(schema.apiSnapshots.current, true));
    await database!.insert(schema.user).values({ id: actor, name: "Pilot test", email: `${actor}@example.test`, role: "ADMIN" });
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-only-token");
    storage.put.mockImplementation(async (path: string, stream: AsyncIterable<Uint8Array>) => {
      for await (const chunk of stream) { expect(chunk.byteLength).toBeGreaterThan(0); }
      return { url: `https://test.private.blob.vercel-storage.com/${path}` };
    });
    storage.del.mockResolvedValue(undefined);
    try {
      const { publishSnapshot, currentSnapshot } = await import("./snapshots");
      await publishSnapshot(actor);
      const published = await currentSnapshot();
      expect(published?.publishedByUserId).toBe(actor);
      expect(storage.put).toHaveBeenCalledTimes(2);
      for (const call of storage.put.mock.calls) expect(call[2]).toMatchObject({ access: "private", addRandomSuffix: false });
      storage.put.mockRejectedValueOnce(new Error("Upload failed"));
      await expect(publishSnapshot(actor)).rejects.toThrow("Upload failed");
      expect((await currentSnapshot())?.id).toBe(published?.id);
      // Failure of the second upload cleans the first orphan without changing the current pointer.
      storage.put.mockResolvedValueOnce({ url: "https://test.private.blob.vercel-storage.com/orphan" }).mockRejectedValueOnce(new Error("Second upload failed"));
      await expect(publishSnapshot(actor)).rejects.toThrow("Second upload failed");
      expect(storage.del).toHaveBeenCalledWith(["https://test.private.blob.vercel-storage.com/orphan"]);
      expect((await currentSnapshot())?.id).toBe(published?.id);
    } finally {
      vi.unstubAllEnvs();
      await database!.delete(schema.apiSnapshots).where(eq(schema.apiSnapshots.publishedByUserId, actor));
      await database!.delete(schema.auditLogs).where(eq(schema.auditLogs.actorUserId, actor));
      await database!.delete(schema.user).where(eq(schema.user.id, actor));
      if (previous[0]) await database!.update(schema.apiSnapshots).set({ current: true }).where(eq(schema.apiSnapshots.id, previous[0].id));
    }
  });

});
