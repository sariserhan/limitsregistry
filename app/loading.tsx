import "./status.css";

export default function Loading() {
  return <main className="status-page" aria-busy="true" aria-live="polite">
    <div className="status-content">
      <span className="status-code">Loading</span>
      <div className="skeleton skeleton-block" style={{ width: 220, height: 14 }} />
    </div>
  </main>;
}
