import { runHealthChecks } from "../../../src/ops/health";

const BADGE_CLASS: Record<string, string> = { ok: "ok", degraded: "down", not_configured: "unconfigured" };
const BADGE_LABEL: Record<string, string> = { ok: "Operational", degraded: "Degraded", not_configured: "Not configured" };

export default async function AdminHealthPage() {
  const checks = await runHealthChecks();

  return <section className="admin-section">
    <h2>Health</h2>
    <p>Live checks against everything this app depends on. Vercel reflects platform-wide status, not this specific deployment — no Vercel API token is configured to query project-level data.</p>
    <div className="admin-status-list">
      {checks.map((check) => <div className="admin-status-row" key={check.name}>
        <div><strong>{check.name}</strong><small>{check.detail}</small></div>
        <span className={`status-badge ${BADGE_CLASS[check.status]}`}>{BADGE_LABEL[check.status]}</span>
      </div>)}
    </div>
  </section>;
}
