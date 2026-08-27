import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const from = process.env.EMAIL_FROM ?? "Limits Registry <auth@limitsregistry.com>";

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  if (!resend) {
    // ponytail: Resend isn't provisioned yet (RESEND_API_KEY unset) — don't break auth flows in dev.
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) console.error(`[email] Resend failed to send "${subject}" to ${to}:`, error);
}
