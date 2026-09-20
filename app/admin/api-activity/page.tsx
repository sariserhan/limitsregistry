import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { readActivity, activitySecret } from "../../../src/api/activity";
import { apiAlertRecipient } from "../../../src/api/activity-alerts";
import { db } from "../../../src/db/client";
import { apiKeys } from "../../../src/db/schema";

export const dynamic = "force-dynamic";
const time = (at: number | null) => at ? new Date(at).toISOString() : "None recorded";

export default async function ApiActivityPage() {
  await requireRole("ADMIN");
  let activity: Awaited<ReturnType<typeof readActivity>>;
  try { activity = await readActivity(); }
  catch { return <section className="admin-section"><h2>API activity unavailable</h2><p role="alert">Could not read activity from Redis. This is not evidence of zero traffic. Check Upstash connectivity and application logs.</p></section>; }
  if (!activity) return <section className="admin-section"><h2>API activity not configured</h2><p>Connect Upstash Redis to collect activity and process alerts. No historical traffic is backfilled.</p></section>;
  const keys = await db.select({ id: apiKeys.id, organization: apiKeys.organizationName, prefix: apiKeys.keyPrefix }).from(apiKeys);
  const labels = new Map(keys.map(key => [key.id, `${key.organization} (${key.prefix}…)`]));
  const totals = new Map<string, { endpoint: string; status: number; method: string; keyId: string; count: number }>();
  const hourly = new Map<number, { total: number; rejected: number; errors: number }>();
  for (const row of activity.rows) {
    const id = `${row.endpoint}|${row.status}|${row.method}|${row.keyId}`;
    const previous = totals.get(id);
    totals.set(id, { ...row, count: row.count + (previous?.count || 0) });
    const hour = hourly.get(row.hour) || { total: 0, rejected: 0, errors: 0 };
    hour.total += row.count;
    if (row.status === 401 || row.status === 429) hour.rejected += row.count;
    if (row.status >= 500) hour.errors += row.count;
    hourly.set(row.hour, hour);
  }
  return <>
    <section className="admin-section">
      <h2>API origin activity</h2>
      <p>Current UTC hour plus the preceding 23 hours. Counts cover requests that reach API handlers, including rejected requests and conditional 304s. Vercel CDN cache hits and requests blocked before the app are excluded. These are best-effort operational counters, not billing records.</p>
      <p>Last recorded request: {time(activity.lastRecorded)}. <Link href="/admin/api-keys">Manage customer keys and download totals →</Link></p>
      <p>Signals require activity spanning at least 60 seconds within a fixed five-minute window. No automatic blocking is applied.</p>
      <ul><li>30 invalid credentials or 60 rate-limited requests from one daily client identifier or resolved key.</li><li>60 snapshot download starts for one key, or 20 server errors on one endpoint.</li><li>At least 500 endpoint requests and five times the preceding window’s volume, with at least 100 requests in that baseline.</li></ul>
      <p>Last alert-job check: {time(activity.lastAlertCheck)}. The job runs every five minutes after deployment.</p>
      <p>Alert summaries: {apiAlertRecipient()} · no more than once per hour · last provider acceptance: {time(activity.lastEmail)}.</p>
      {!process.env.RESEND_API_KEY && <p role="alert">Email delivery is not configured. Signals still appear below; configure RESEND_API_KEY for email alerts.</p>}
      {activitySecret().length < 32 && <p role="alert">Per-client detection is disabled. Set API_ACTIVITY_SECRET (or CRON_SECRET) to at least 32 characters. Endpoint and resolved-key monitoring still work.</p>}
      {activity.emailError && <p role="alert">{activity.emailError}</p>}
      {!activity.lastRecorded && <p>No requests have been recorded yet. Monitoring starts after deployment; missing data does not prove there was no traffic.</p>}
    </section>
    <section className="admin-section"><h2>Signals to review</h2><p>Most recent 100 signals, retained for up to 24 hours. High usage and shared network addresses do not by themselves prove abuse.</p>
      {!activity.signals.length ? <p>No recent signals.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>UTC</th><th>Signal</th><th>Endpoint</th><th>Subject</th><th>Count at detection</th></tr></thead><tbody>{activity.signals.map((signal, index) => <tr key={`${signal.at}-${index}`}><td>{time(signal.at)}</td><td>{signal.kind}</td><td>{signal.endpoint}</td><td>{signal.subject.startsWith("key:") ? labels.get(signal.subject.slice(4)) || signal.subject : signal.subject}</td><td>{signal.count}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="admin-section"><h2>Requests by endpoint, status and customer</h2>
      {!totals.size ? <p>No counters in this time range.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Endpoint</th><th>Method</th><th>Status</th><th>Customer key</th><th>Requests</th></tr></thead><tbody>{[...totals.entries()].sort((a, b) => b[1].count - a[1].count).map(([id, row]) => <tr key={id}><td>{row.endpoint}</td><td>{row.method}</td><td>{row.status}</td><td>{row.keyId === "anonymous" ? "Anonymous / unresolved" : labels.get(row.keyId) || row.keyId}</td><td>{row.count}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="admin-section"><h2>Hourly trend (UTC)</h2><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Hour starting</th><th>Requests</th><th>401 / 429</th><th>5xx</th></tr></thead><tbody>{[...hourly.entries()].sort((a, b) => b[0] - a[0]).map(([hour, counts]) => <tr key={hour}><td>{time(hour * 3_600_000)}</td><td>{counts.total}</td><td>{counts.rejected}</td><td>{counts.errors}</td></tr>)}</tbody></table></div></section>
  </>;
}
