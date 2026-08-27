import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { inboxMessages } from "./schema";
import { renderEmail, escapeHtml } from "../lib/email/template";
import { sendEmail, SENDERS } from "../lib/email/resend";

export type InboxChannel = "CONTACT" | "SUPPORT";

export type NewInboxMessage = { channel: InboxChannel; name: string; email: string; subject?: string; message: string };

export async function createInboxMessage(input: NewInboxMessage) {
  const [row] = await db.insert(inboxMessages).values(input).returning();
  return row;
}

export async function listInboxMessages(channel: InboxChannel) {
  return db.select().from(inboxMessages).where(eq(inboxMessages.channel, channel)).orderBy(desc(inboxMessages.createdAt));
}

export async function replyToInboxMessage(id: string, replyBody: string, actorUserId: string) {
  const rows = await db.select().from(inboxMessages).where(eq(inboxMessages.id, id)).limit(1);
  const target = rows[0];
  if (!target) throw new Error("Message not found.");
  // target.subject came from an unauthenticated public form (see app/contact, app/support) —
  // renderEmail interpolates heading raw (callers must pre-escape), so escape it before it
  // reaches the template. replyBody is admin-typed (ADMIN role required to call this), so it's
  // trusted and left as-is — escaping it would also mangle the plaintext fallback with entities.
  const plainSubject = target.subject ? `Re: ${target.subject}` : "A reply from Limits Registry";
  const { html, text } = renderEmail({
    preheader: replyBody.slice(0, 120),
    heading: target.subject ? `Re: ${escapeHtml(target.subject)}` : "A reply from Limits Registry",
    intro: replyBody,
    ctaLabel: "",
    ctaUrl: "",
  });
  await sendEmail({ to: target.email, from: SENDERS.support, replyTo: SENDERS.support, subject: plainSubject, html, text });
  await db.update(inboxMessages).set({ replyBody, repliedAt: new Date(), repliedByUserId: actorUserId, status: "RESOLVED" }).where(eq(inboxMessages.id, id));
}
