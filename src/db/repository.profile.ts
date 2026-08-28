import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { authorProfiles, user } from "./schema";

export async function getUserProfile(userId: string) {
  const rows = await db.select({ name: user.name, email: user.email, affiliation: authorProfiles.affiliation, orcid: authorProfiles.orcid, website: authorProfiles.website }).from(user).leftJoin(authorProfiles, eq(authorProfiles.userId, user.id)).where(eq(user.id, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateUserProfile(userId: string, input: { name: string; affiliation: string | null; orcid: string | null; website: string | null }) {
  await db.update(user).set({ name: input.name, updatedAt: new Date() }).where(eq(user.id, userId));
  await db.insert(authorProfiles).values({ userId, affiliation: input.affiliation, orcid: input.orcid, website: input.website }).onConflictDoUpdate({ target: authorProfiles.userId, set: { affiliation: input.affiliation, orcid: input.orcid, website: input.website, updatedAt: new Date() } });
}
