import "server-only";
import { renderDigestEmail, type DigestItem } from "./template";
import { sendEmail, SENDERS } from "./resend";
import { signUnsubscribe } from "../../watchlists/security";
import type { ClaimedNotification } from "../../db/repository.watchlists";
export async function sendWatchlistEmail(rows: ClaimedNotification[]) {
  if (!rows.length) return { sent: true as const, id: null };
  const first = rows[0]; const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const unsubscribeToken = signUnsubscribe(first.follow.id, first.follow.email);
  const unsubscribeUrl = `${siteUrl}/watchlists/unsubscribe?follow=${encodeURIComponent(first.follow.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
  const items: DigestItem[] = rows.map(({ event, limit }) => ({ label: event.eventType.replaceAll("_", " "), title: String(event.payload.title ?? limit.title), meta: String(event.payload.summary ?? `Accepted update on ${limit.registryNumber}`), url: `${siteUrl}/limits/${limit.registryNumber}` }));
  const instant = first.follow.frequency === "INSTANT" && rows.length === 1;
  const { html, text } = renderDigestEmail({ preheader: `${items.length} accepted update${items.length === 1 ? "" : "s"} for ${first.limit.title}.`, heading: instant ? `Frontier update — ${first.limit.registryNumber}` : `Weekly watchlist — ${first.limit.registryNumber}`, intro: instant ? `An accepted editorial change was published for ${first.limit.title}.` : `Here are this week's accepted changes for ${first.limit.title}.`, sections: [{ title: "Accepted Registry changes", items }], ctaLabel: `Open ${first.limit.registryNumber}`, ctaUrl: `${siteUrl}/limits/${first.limit.registryNumber}`, note: `You receive this because you follow ${first.limit.registryNumber}. Unsubscribe: ${unsubscribeUrl}` });
  return sendEmail({ to: first.follow.email, from: SENDERS.support, subject: instant ? `${first.limit.registryNumber}: accepted frontier update` : `${first.limit.registryNumber}: weekly watchlist digest`, html, text });
}
