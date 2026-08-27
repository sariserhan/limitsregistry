import "./dependencies.css";
import "../status.css";

export default function Loading() {
  return <main className="dependencies-page" aria-busy="true" aria-live="polite">
    <div style={{ height: 78 }} />
    <div className="skeleton skeleton-block" style={{ width: 320, height: 44, margin: "80px 0 24px" }} />
    <div className="skeleton skeleton-block" style={{ width: "100%", height: 460 }} />
  </main>;
}
