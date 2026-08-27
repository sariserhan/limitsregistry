import "server-only";
import { sendEmail, SENDERS } from "./resend";
import { renderDigestEmail, type DigestItem } from "./template";
import type { WeeklyDigestData } from "../../db/repository.digest";

function formatDateRange(since: Date) {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(since)} – ${fmt(now)}`;
}

export async function sendWeeklyDigestEmail(to: string, name: string, data: WeeklyDigestData) {
  const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const totalActivity = data.newlyPublished.length + data.acceptedClaims.length + data.newSubmissions.length;

  const publishedItems: DigestItem[] = data.newlyPublished.map((l) => ({ label: l.registryNumber, title: l.title, meta: "Newly published", url: `${siteUrl}/limits/${l.registryNumber}` }));
  const acceptedItems: DigestItem[] = data.acceptedClaims.map((c) => ({ label: c.claimNumber, title: c.title, meta: `Accepted on ${c.registryNumber}`, url: `${siteUrl}/limits/${c.registryNumber}` }));
  const submissionItems: DigestItem[] = data.newSubmissions.map((s) => ({ label: s.registryNumber, title: s.title, meta: `Status: ${s.status.replaceAll("_", " ")}`, url: `${siteUrl}/console` }));

  const { html, text } = renderDigestEmail({
    preheader: `${totalActivity} update${totalActivity === 1 ? "" : "s"} this week on Limits Registry.`,
    heading: `Weekly digest — ${formatDateRange(data.since)}`,
    intro: `Hi ${name}, here's what moved on the Registry this week: ${data.newlyPublished.length} newly published Limit${data.newlyPublished.length === 1 ? "" : "s"}, ${data.acceptedClaims.length} accepted Claim${data.acceptedClaims.length === 1 ? "" : "s"}, and ${data.newSubmissions.length} new public submission${data.newSubmissions.length === 1 ? "" : "s"}.`,
    sections: [
      { title: "Newly published Limits", items: publishedItems },
      { title: "Accepted Claims", items: acceptedItems },
      { title: "New public submissions", items: submissionItems },
    ],
    ctaLabel: "Open the Research Console",
    ctaUrl: `${siteUrl}/console`,
    note: "You're getting this because you hold an editorial role (Editor, Admin, or Superadmin) on Limits Registry.",
  });

  await sendEmail({ to, from: SENDERS.support, subject: `Weekly digest: ${totalActivity} update${totalActivity === 1 ? "" : "s"} on Limits Registry`, html, text });
}
