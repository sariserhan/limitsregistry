import "server-only";
import { desc } from "drizzle-orm";
import { db } from "./client";
import { adminSentEmails } from "./schema";

export type NewAdminSentEmail = { toEmail: string; subject: string; heading: string; body: string; footerNote?: string; sentByUserId: string };

export async function logAdminSentEmail(input: NewAdminSentEmail) {
  const [row] = await db.insert(adminSentEmails).values(input).returning();
  return row;
}

export async function listRecentAdminSentEmails(limit = 5) {
  return db.select().from(adminSentEmails).orderBy(desc(adminSentEmails.createdAt)).limit(limit);
}
