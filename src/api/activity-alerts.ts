import "server-only";
import { randomUUID } from "node:crypto";
import { ACTIVITY_PREFIX, activityRedis, readActivity } from "./activity";
import { sendEmail } from "../lib/email/resend";
import { escapeHtml } from "../lib/email/template";

export function apiAlertRecipient() { return process.env.API_ALERT_EMAIL || "serhan.sari@yahoo.com"; }

export async function sendApiActivityAlert(now = Date.now()) {
  const redis = activityRedis();
  if (!redis) throw new Error("Activity storage is not configured.");
  const p = ACTIVITY_PREFIX;
  const token = randomUUID();
  const lock = await redis.set(`${p}:email-lock`, token, { nx: true, ex: 300 });
  if (!lock) return { sent: false, reason: "busy" };
  try {
    await redis.set(`${p}:last-alert-check`, now, { ex: 172800 });
    const activity = await readActivity(now);
    if (!activity) throw new Error("Activity storage unavailable.");
    if (activity.lastEmail && now - activity.lastEmail < 3_600_000) return { sent: false, reason: "cooldown" };
    const signals = activity.signals.filter(signal => signal.at > (activity.lastEmail || 0));
    if (!signals.length) return { sent: false, reason: "no-new-signals" };
    const text = [
      `${signals.length} API activity signals need review. These are indicators, not proof of abuse.`,
      "Origin requests only; public CDN cache hits are excluded.",
      ...signals.slice(0, 20).map(signal => `${new Date(signal.at).toISOString()} — ${signal.kind} — ${signal.endpoint} — ${signal.subject} — ${signal.count} requests in a five-minute window`),
      "Review: https://www.limitsregistry.com/admin/api-activity",
    ].join("\n\n");
    const result = await sendEmail({ to: apiAlertRecipient(), subject: "API activity needs review — Limits Registry", text, html: `<p>${escapeHtml(text).replaceAll("\n", "<br/>")}</p>` });
    if (!result.sent) {
      await redis.set(`${p}:email-error`, "Alert email was not accepted by the provider. Check Resend configuration and delivery logs.", { ex: 86400 });
      return { sent: false, reason: "delivery-failed" };
    }
    await redis.set(`${p}:last-email`, now, { ex: 172800 });
    await redis.del(`${p}:email-error`);
    return { sent: true, signals: signals.length };
  } catch {
    await redis.set(`${p}:email-error`, "Alert processing failed. Check Redis, Resend configuration, and cron logs.", { ex: 86400 }).catch(() => undefined);
    throw new Error("Alert processing failed.");
  } finally {
    await redis.eval("if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0", [`${p}:email-lock`], [token]);
  }
}
