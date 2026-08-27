import "./search.css";
import "../status.css";

export default function Loading() {
  return <main className="search-page" aria-busy="true" aria-live="polite">
    <div style={{ height: 78 }} />
    <div className="skeleton skeleton-block" style={{ width: 320, height: 44, margin: "60px 0 20px" }} />
    <div className="skeleton skeleton-block" style={{ width: "100%", maxWidth: 620, height: 48 }} />
  </main>;
}
