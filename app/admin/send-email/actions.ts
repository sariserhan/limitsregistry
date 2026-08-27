"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../../src/auth/session";
import { renderEmail } from "../../../src/lib/email/template";
import { sendEmail, SENDERS } from "../../../src/lib/email/resend";
import { logAdminSentEmail } from "../../../src/db/repository.admin-email";

export async function sendAdminEmail(formData: FormData) {
  const session = await requireRole("ADMIN");
  const toEmail = String(formData.get("toEmail") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const heading = String(formData.get("heading") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const footerNote = String(formData.get("footerNote") ?? "").trim();
  const senderKey = String(formData.get("from") ?? "support");
  const from = senderKey in SENDERS ? SENDERS[senderKey as keyof typeof SENDERS] : SENDERS.support;

  if (!toEmail || !subject || !heading || !body) throw new Error("To, subject, hello, and body are all required.");

  const { html, text } = renderEmail({ preheader: body.slice(0, 120), heading, intro: body, ctaLabel: "", ctaUrl: "", note: footerNote || undefined });
  await sendEmail({ to: toEmail, from, replyTo: from, subject, html, text });
  await logAdminSentEmail({ toEmail, subject, heading, body, footerNote: footerNote || undefined, sentByUserId: session.user.id });
  revalidatePath("/admin/send-email");
}
