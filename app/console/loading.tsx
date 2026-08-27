import "./console.css";
import "../status.css";

export default function Loading() {
  return <main className="console-page" aria-busy="true" aria-live="polite">
    <div className="skeleton skeleton-block" style={{ width: 260, height: 34, marginBottom: 40 }} />
    {[0, 1].map((i) => <section key={i}>
      <div className="skeleton skeleton-block" style={{ width: 160, height: 18, marginBottom: 18 }} />
      <div className="skeleton skeleton-block" style={{ width: "100%", height: 48 }} />
    </section>)}
  </main>;
}
