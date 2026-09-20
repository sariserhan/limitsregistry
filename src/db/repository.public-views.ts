import "server-only";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "./client";
import { limits, researchBounties, publicViewCounts, publicViewReceipts } from "./schema";
import { bountyCoversLimit } from "./bounty-scope";
import { PUBLIC_LIMIT_STATUSES } from "./repository.public-limits";
import { viewRequestSchema } from "../domain/public-views";

export async function recordPublicView(raw: unknown) {
  const input = viewRequestSchema.parse(raw);
  return db.transaction(async tx => {
    const publicStatus = inArray(limits.status, PUBLIC_LIMIT_STATUSES);
    const matches = input.kind === "BOUNTY"
      ? await tx.select({ id: researchBounties.id }).from(researchBounties).innerJoin(limits, bountyCoversLimit).where(and(eq(researchBounties.id, input.target), eq(researchBounties.status, "VERIFIED"), publicStatus)).limit(1)
      : await tx.select({ id: limits.id }).from(limits).where(and(publicStatus, input.kind === "LIMIT" ? eq(limits.registryNumber, input.target) : eq(limits.category, input.target))).limit(1);
    if (!matches.length) return null;
    const [receipt] = await tx.insert(publicViewReceipts).values({ id: input.receipt }).onConflictDoNothing().returning({ id: publicViewReceipts.id });
    const where = and(eq(publicViewCounts.kind, input.kind), eq(publicViewCounts.target, input.target));
    const [count] = receipt
      ? await tx.insert(publicViewCounts).values({ kind: input.kind, target: input.target, views: 1n }).onConflictDoUpdate({ target: [publicViewCounts.kind, publicViewCounts.target], set: { views: sql`${publicViewCounts.views} + 1` } }).returning()
      : await tx.select().from(publicViewCounts).where(where).limit(1);
    return { views: (count?.views ?? 0n).toString(), startedAt: count?.startedAt.toISOString() ?? null };
  });
}

export async function prunePublicViewReceipts() {
  await db.delete(publicViewReceipts).where(lt(publicViewReceipts.createdAt, new Date(Date.now() - 48 * 3_600_000)));
}
