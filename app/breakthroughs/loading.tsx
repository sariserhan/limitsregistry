import "./breakthroughs.css";
import "../status.css";

export default function Loading() {
  return <main className="breakthroughs-page" aria-busy="true" aria-live="polite">
    <div style={{ height: 78 }} />
    <div className="skeleton skeleton-block" style={{ width: 320, height: 44, margin: "80px 0 24px" }} />
    {[0, 1, 2].map((i) => <div key={i} className="skeleton skeleton-block" style={{ width: "100%", height: 70, marginBottom: 12 }} />)}
  </main>;
}
