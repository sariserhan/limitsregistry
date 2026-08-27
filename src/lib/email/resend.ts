import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Purpose-specific senders — matches the addresses actually verified on the domain and
// the support@ address already published site-wide (About, Terms, Privacy, Support, etc.).
export const SENDERS = {
  welcome: "Limits Registry <welcome@limitsregistry.com>",
  support: "Limits Registry <support@limitsregistry.com>",
} as const;

export async function sendEmail({ to, from = SENDERS.support, replyTo, subject, html, text }: { to: string; from?: string; replyTo?: string; subject: string; html: string; text: string }) {
  if (!resend) {
    // ponytail: Resend isn't provisioned yet (RESEND_API_KEY unset) — don't break auth flows in dev.
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, replyTo, subject, html, text });
  if (error) console.error(`[email] Resend failed to send "${subject}" to ${to}:`, error);
}
