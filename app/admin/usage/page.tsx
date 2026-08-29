import { getDatabaseUsage, getUpstashUsage, getVercelUsage, getNeonUsage, getAiGatewayConfigured, type UsageStat } from "../../../src/ops/usage";

export default async function AdminUsagePage() {
  const [dbUsage, upstashUsage, vercelUsage, neonUsage] = await Promise.all([getDatabaseUsage(), getUpstashUsage(), getVercelUsage(), getNeonUsage()]);
  const remoteStats: UsageStat[] = [upstashUsage, vercelUsage, neonUsage];
  const configured = remoteStats.filter((stat) => stat.value !== "—");
  const unconfigured = remoteStats.filter((stat) => stat.value === "—");
  if (!getAiGatewayConfigured()) unconfigured.push({ label: "AI Gateway usage", value: "—", detail: "Not configured — add AI_GATEWAY_API_KEY" });

  return <section className="admin-section">
    <h2>Usage</h2>
    <p>Real counts only — anything without a configured API token, or that the API rejected, is shown as unconfigured rather than guessed.</p>
    <div className="admin-stat-grid">
      {dbUsage.map((stat) => <div className="admin-stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}
      {configured.map((stat) => <div className="admin-stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong>{stat.detail && <small style={{ display: "block", color: "var(--faint)", fontSize: 11, marginTop: 6 }}>{stat.detail}</small>}</div>)}
    </div>
    <div className="admin-status-list" style={{ marginTop: 24 }}>
      {unconfigured.map((row) => <div className="admin-status-row" key={row.label}>
        <div><strong>{row.label}</strong><small>{row.detail}</small></div>
        <span className="status-badge unconfigured">Not configured</span>
      </div>)}
    </div>
  </section>;
}
