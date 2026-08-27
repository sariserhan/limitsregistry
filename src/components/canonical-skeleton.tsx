import "../../app/status.css";

export function CanonicalSkeleton({ tag }: { tag: string }) {
  return <main className="canonical-page" aria-busy="true" aria-live="polite">
    <header className="canonical-header">
      <span className="brand"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></span>
      <span className="header-tag">{tag}</span>
    </header>
    <section className="canonical-intro">
      <div className="skeleton skeleton-block" style={{ width: 120, height: 11, marginBottom: 14 }} />
      <div className="skeleton skeleton-block" style={{ width: "60%", height: 34, marginBottom: 16 }} />
      <div className="skeleton skeleton-block" style={{ width: "85%", height: 14, marginBottom: 8 }} />
      <div className="skeleton skeleton-block" style={{ width: "70%", height: 14 }} />
    </section>
    <section className="canonical-columns"><div className="canonical-main">
      <div className="skeleton skeleton-block" style={{ width: 160, height: 16, marginBottom: 20 }} />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton skeleton-block" style={{ width: "100%", height: 52, marginBottom: 12 }} />)}
    </div></section>
  </main>;
}
