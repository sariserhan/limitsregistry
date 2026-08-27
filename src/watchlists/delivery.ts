import "server-only";
import { claimDueNotifications, markNotificationsFailed, markNotificationsSent, recoverStaleDeliveries, type WatchFrequency } from "../db/repository.watchlists";
import { sendWatchlistEmail } from "../lib/email/watchlist-email";
export async function deliverWatchlistNotifications(frequency: WatchFrequency) {
  await recoverStaleDeliveries();
  const claimed = await claimDueNotifications(frequency);
  const groups: Array<typeof claimed> = [];
  if (frequency === "INSTANT") for (const row of claimed) groups.push([row]);
  else { const byFollow = new Map<string, typeof claimed>(); for (const row of claimed) byFollow.set(row.follow.id, [...(byFollow.get(row.follow.id) ?? []), row]); groups.push(...byFollow.values()); }
  let sent = 0, failed = 0;
  for (const rows of groups) { try { const result = await sendWatchlistEmail(rows); if (result.sent) { await markNotificationsSent(rows.map((row) => row.notification.id), result.id); sent += rows.length; } else { await markNotificationsFailed(rows.map((row) => ({ id: row.notification.id, attempts: row.notification.attempts })), result.error); failed += rows.length; } } catch (error) { await markNotificationsFailed(rows.map((row) => ({ id: row.notification.id, attempts: row.notification.attempts })), error instanceof Error ? error.message : "Unknown email delivery failure."); failed += rows.length; } }
  return { claimed: claimed.length, sent, failed };
}
