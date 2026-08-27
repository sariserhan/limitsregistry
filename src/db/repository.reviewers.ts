import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { reviewerProfiles, user } from "./schema";

export async function getReviewerProfile(userId: string) {
  const rows = await db.select().from(reviewerProfiles).where(eq(reviewerProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertReviewerProfile(userId: string, fieldsOfExpertise: string[], credentials: string | null, bio: string | null) {
  await db.insert(reviewerProfiles).values({ userId, fieldsOfExpertise, credentials, bio })
    .onConflictDoUpdate({ target: reviewerProfiles.userId, set: { fieldsOfExpertise, credentials, bio, updatedAt: new Date() } });
}

// Directory of reviewers with a profile. Self-reported — never presented as independently verified.
export async function listReviewerNetwork() {
  return db.select({ userId: user.id, name: user.name, email: user.email, role: user.role, fieldsOfExpertise: reviewerProfiles.fieldsOfExpertise, credentials: reviewerProfiles.credentials, bio: reviewerProfiles.bio })
    .from(reviewerProfiles)
    .innerJoin(user, eq(user.id, reviewerProfiles.userId));
}
