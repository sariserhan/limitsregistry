import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "./client";
import { bounties } from "./schema";

export type BountyStatus = "ACTIVE" | "CLAIMED" | "EXPIRED" | "WITHDRAWN";

export async function listBountiesForLimit(limitId: string) {
  return db.select().from(bounties).where(eq(bounties.limitId, limitId)).orderBy(asc(bounties.createdAt));
}

export async function listAllBounties() {
  return db.select().from(bounties).orderBy(asc(bounties.createdAt));
}

export type NewBounty = { limitId: string; name: string; sponsor: string; amount?: string; url: string; notes?: string; addedByUserId: string };

export async function createBounty(input: NewBounty) {
  const [row] = await db.insert(bounties).values(input).returning();
  return row;
}

export async function updateBountyStatus(id: string, status: BountyStatus) {
  const [row] = await db.update(bounties).set({ status, updatedAt: new Date() }).where(eq(bounties.id, id)).returning();
  return row ?? null;
}
