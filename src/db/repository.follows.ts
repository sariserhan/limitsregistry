import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { follows } from "./schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// subscriberKey is an email address for now — no delivery is wired up yet (see
// TODO_NEXT_ROADMAP.md section 5's still-unchecked "email notification preferences" /
// "connect events to email and weekly digest delivery"); this just proves the subscribe
// action works and gives a real row to build that delivery on top of later. The per-Limit
// RSS feed (/api/watchlists/rss?limitId=...) is the actual, working delivery mechanism today.
export async function subscribeToLimit(limitId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) throw new Error("Enter a valid email address.");
  await db.insert(follows).values({ limitId, subscriberKey: normalized }).onConflictDoNothing();
}

export async function countFollowers(limitId: string) {
  const rows = await db.select({ id: follows.id }).from(follows).where(eq(follows.limitId, limitId));
  return rows.length;
}
