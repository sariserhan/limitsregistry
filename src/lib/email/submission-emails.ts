import "server-only";
import { sendEmail, SENDERS } from "./resend";
import { escapeHtml, renderEmail } from "./template";

const siteUrl = () => process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export async function sendSubmissionReceivedEmail(to: string, name: string, registryNumber: string, title: string, submissionId: string) {
  const { html, text } = renderEmail({
    preheader: "Your Limits Registry challenge is in the editorial queue.",
    heading: "Challenge received",
    intro: `Hi ${escapeHtml(name)}, your proposal “${escapeHtml(title)}” for ${escapeHtml(registryNumber)} is now in the editorial queue. The public record will not change until an editor verifies the scope and evidence.`,
    ctaLabel: "Track your submission",
    ctaUrl: `${siteUrl()}/submit#submission-${encodeURIComponent(submissionId)}`,
    note: "We will email you when an editor records a decision.",
  });
  await sendEmail({ to, from: SENDERS.support, replyTo: SENDERS.support, subject: `Challenge received: ${registryNumber} — Limits Registry`, html, text });
}

export async function sendSubmissionDecisionEmail(to: string, name: string, registryNumber: string, title: string, status: string, notes: string, submissionId: string) {
  const decision = status.replaceAll("_", " ").toLowerCase();
  const { html, text } = renderEmail({
    preheader: `An editor updated your Limits Registry challenge: ${decision}.`,
    heading: `Challenge ${decision}`,
    intro: `Hi ${escapeHtml(name)}, an editor has marked your proposal “${escapeHtml(title)}” for ${escapeHtml(registryNumber)} as ${escapeHtml(decision)}. Reviewer note: ${escapeHtml(notes)}`,
    ctaLabel: "View submission status",
    ctaUrl: `${siteUrl()}/submit#submission-${encodeURIComponent(submissionId)}`,
    note: status === "ACCEPTED" ? "Acceptance records an editorial decision; the public frontier changes only when the resulting Claim is published." : "You can revise a proposal when the reviewer asks for more evidence or clarification.",
  });
  await sendEmail({ to, from: SENDERS.support, replyTo: SENDERS.support, subject: `Challenge ${decision}: ${registryNumber} — Limits Registry`, html, text });
}
