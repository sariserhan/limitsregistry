import "./admin.css";
import "../status.css";

export default function Loading() {
  return <main className="admin-shell" aria-busy="true" aria-live="polite">
    <div className="skeleton skeleton-block" style={{ width: 200, height: 34, marginBottom: 40 }} />
    {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-block" style={{ width: "100%", height: 44, marginBottom: 10 }} />)}
  </main>;
}
