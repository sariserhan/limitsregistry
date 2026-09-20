"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "../../../src/auth/session";
import { db } from "../../../src/db/client";
import { apiKeys, auditLogs } from "../../../src/db/schema";
import { newApiKey } from "../../../src/api/key-token";
import { publishSnapshot, snapshotStorageConfigured } from "../../../src/api/snapshots";
import { allowRequest } from "../../../src/ops/rate-limit";

const inputSchema = z.object({ organizationName: z.string().trim().min(1).max(200), contactEmail: z.email().max(254), note: z.string().trim().max(2000) });

export async function issueKey(formData: FormData) {
  const session = await requireRole("ADMIN");
  const input = inputSchema.safeParse({ organizationName: formData.get("organizationName"), contactEmail: formData.get("contactEmail"), note: formData.get("note") ?? "" });
  if (!input.success) return { error: "Enter an organisation (up to 200 characters), a valid contact email, and a note up to 2,000 characters." };
  const { plaintext, ...credential } = newApiKey();
  try {
    await db.transaction(async (tx) => {
      const [key] = await tx.insert(apiKeys).values({ ...input.data, ...credential, issuedByUserId: session.user.id }).returning({ id: apiKeys.id });
      // Never put the token or its hash in audit events or error messages.
      await tx.insert(auditLogs).values({ actorUserId: session.user.id, action: "API_KEY_ISSUED", entityType: "API_KEY", entityId: key.id, after: { prefix: credential.keyPrefix, tier: "PILOT" } });
    });
  } catch { return { error: "The key could not be issued. Please retry." }; }
  revalidatePath("/admin/api-keys");
  return { plaintext };
}

export async function revokeKey(id: string) {
  const session = await requireRole("ADMIN");
  if (!z.uuid().safeParse(id).success) return { error: "Invalid key identifier." };
  try {
    await db.transaction(async (tx) => {
      const [key] = await tx.update(apiKeys).set({ status: "REVOKED", revokedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(apiKeys.id, id), eq(apiKeys.status, "ACTIVE"))).returning({ id: apiKeys.id });
      if (key) await tx.insert(auditLogs).values({ actorUserId: session.user.id, action: "API_KEY_REVOKED", entityType: "API_KEY", entityId: key.id });
    });
  } catch { return { error: "The key could not be revoked. Please retry." }; }
  revalidatePath("/admin/api-keys");
  return { message: "Key revoked. Snapshot access is disabled; public endpoints remain available." };
}

export async function publishCurrentSnapshot() {
  const session = await requireRole("ADMIN");
  if (!snapshotStorageConfigured()) return { error: "Connect a private Blob store before publishing a snapshot." };
  try {
    if (!(await allowRequest("snapshot-publication", 1, 60_000))) return { error: "A publication was recently requested. Wait a minute before trying again." };
    const result = await publishSnapshot(session.user.id);
    revalidatePath("/admin/api-keys");
    return { message: `Published ${result.recordCount} records. Revision ${result.revision.slice(0, 12)}.` };
  } catch { return { error: "Snapshot publication failed. The previous snapshot is still available. Check database and private Blob storage configuration, then retry." }; }
}
