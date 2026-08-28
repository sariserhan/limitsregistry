import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { user } from "./schema";

export async function getUserProfile(userId: string) {
  const rows = await db.select({ name: user.name, email: user.email, affiliation: user.affiliation, orcid: user.orcid, website: user.website }).from(user).where(eq(user.id, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateUserProfile(userId: string, input: { name: string; affiliation: string | null; orcid: string | null; website: string | null }) {
  await db.update(user).set({ ...input, updatedAt: new Date() }).where(eq(user.id, userId));
}
