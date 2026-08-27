import "../../console.css";
import "../../../status.css";

export default function Loading() {
  return <main className="console-page" aria-busy="true" aria-live="polite">
    <div className="skeleton skeleton-block" style={{ width: 260, height: 34, marginBottom: 40 }} />
    <div className="skeleton skeleton-block" style={{ width: "100%", height: 180, marginBottom: 30 }} />
    {[0, 1, 2].map((i) => <div key={i} className="skeleton skeleton-block" style={{ width: "100%", height: 90, marginBottom: 12 }} />)}
  </main>;
}
