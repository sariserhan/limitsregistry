import { getAcquisitionReportSafe } from "../../../src/db/repository.analytics";

export default async function AdminAcquisitionPage() {
  const result = await getAcquisitionReportSafe(30);
  const report = result.report;

  return (
    <section className="admin-section">
      <h2>Acquisition analytics</h2>
      <p>Privacy-minimal first-party page-view events for the last {report.days} days. No user identity or IP address is stored.</p>
      {!result.available ? (
        <div className="admin-panel">
          <strong>Analytics storage is not available yet.</strong>
          <p>Apply migration <code>0023_acquisition_events.sql</code> to the database used by this deployment, then refresh this page.</p>
        </div>
      ) : null}
      <div className="admin-stat-grid">
        {report.totals.map((row) => (
          <article className="admin-stat-card" key={row.eventName}>
            <span>{row.eventName.replaceAll("_", " ")}</span>
            <strong>{row.count.toLocaleString()}</strong>
          </article>
        ))}
      </div>
      <div className="admin-panel">
        <h3>Top landing paths</h3>
        {report.paths.length ? report.paths.map((row) => <p key={row.path}><strong>{row.count.toLocaleString()}</strong> · {row.path}</p>) : <p>No page-view data yet.</p>}
      </div>
      <div className="admin-panel">
        <h3>Referrers</h3>
        {report.referrers.length ? report.referrers.map((row) => <p key={row.referrer}><strong>{row.count.toLocaleString()}</strong> · {row.referrer}</p>) : <p>No referrer data yet.</p>}
      </div>
    </section>
  );
}
