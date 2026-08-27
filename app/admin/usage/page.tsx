import { getDatabaseUsage, getUpstashUsage, getUnconfiguredUsage } from "../../../src/ops/usage";

export default async function AdminUsagePage() {
  const [dbUsage, upstashUsage] = await Promise.all([getDatabaseUsage(), getUpstashUsage()]);
  const unconfigured = getUnconfiguredUsage();

  return <section className="admin-section">
    <h2>Usage</h2>
    <p>Real counts only — anything without a configured API token is shown as unconfigured rather than guessed.</p>
    <div className="admin-stat-grid">
      {dbUsage.map((stat) => <div className="admin-stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}
      <div className="admin-stat-card"><span>{upstashUsage.label}</span><strong>{upstashUsage.value}</strong>{upstashUsage.detail && <small style={{ display: "block", color: "var(--faint)", fontSize: 11, marginTop: 6 }}>{upstashUsage.detail}</small>}</div>
    </div>
    <div className="admin-status-list" style={{ marginTop: 24 }}>
      {unconfigured.map((row) => <div className="admin-status-row" key={row.label}>
        <div><strong>{row.label}</strong><small>{row.detail}</small></div>
        <span className="status-badge unconfigured">Not configured</span>
      </div>)}
    </div>
  </section>;
}
