import Link from "next/link";

type PageProps = { params: Promise<{ id: string }> };

const records: Record<string, { id: string; category: string; title: string; summary: string; achievable: string; bound: string; gap: string; mode: "integer" | "asymptotic" }> = {
  "LR-000072": { id: "LR-000072", category: "MATHEMATICS / OPTIMIZATION", title: "Chromatic number of the plane", summary: "What is the fewest number of colors needed to color every point in the plane so that points exactly one unit apart receive different colors?", achievable: "5", bound: "7", gap: "2 colors", mode: "integer" },
  "LR-000127": { id: "LR-000127", category: "MATHEMATICS / GRAPH THEORY", title: "Maximum edges in a triangle-free graph", summary: "How dense can a graph be while containing no triangle?", achievable: "n² / 4", bound: "n² / 4", gap: "Closed", mode: "integer" },
  "LR-000098": { id: "LR-000098", category: "MATHEMATICS / COMBINATORICS", title: "Largest cap set in [3]ⁿ", summary: "The largest subset of a grid containing no three points in a line.", achievable: "Θ(3ⁿ / n)", bound: "O(3ⁿ / n¹·⁶)", gap: "Asymptotic", mode: "asymptotic" },
};

const claims = [
  ["CLM-000184", "L ≥ 5", "CONSTRUCTION / LOWER BOUND", "de Grey, 2018", "SOURCE_CONFIRMED"],
  ["CLM-000208", "L ≤ 7", "UPPER BOUND", "Exoo & Ismailescu, 2019", "PROVEN"],
  ["CLM-000119", "L ≥ 4", "LOWER BOUND", "Erdős, Ko, and Rado, 1950", "PROVEN"],
];

export default async function LimitPage({ params }: PageProps) {
  const { id } = await params;
  const record = records[id] ?? records["LR-000072"];
  return <main className="canonical-page">
    <header className="canonical-header"><Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></Link><nav><Link href="/">Browse</Link><Link href="#claims">Claims</Link><Link href="#specification">Specification</Link><Link href="#evidence">Evidence</Link></nav><span className="header-tag">PUBLIC RECORD</span></header>
    <section className="canonical-intro"><div className="canonical-category">{record.category}</div><div className="canonical-id-row"><span className="canonical-id">{record.id}</span><span className="canonical-status">OPEN LIMIT</span></div><h1>{record.title}</h1><p>{record.summary}</p><div className="intro-foot"><span>Specification version 2</span><span>Last updated May 12, 2025</span><span>19 cited papers</span></div></section>
    <section className="knowledge-section"><div className="section-title"><span>01</span><h2>What we know</h2><p>Current frontiers derived from accepted Claims.</p></div><div className={`frontier ${record.mode}`}><div className="frontier-labels"><span>PROVEN LOWER BOUND</span><span>BEST CONSTRUCTION</span></div><div className="frontier-values"><strong>{record.achievable}</strong><div className="frontier-line"><i /><span>UNKNOWN GAP</span><i /></div><strong>{record.bound}</strong></div><div className="frontier-foot"><span>Achievable frontier</span><span>{record.gap}</span><span>Proven bound</span></div></div></section>
    <section className="canonical-columns"><div className="canonical-main"><div className="section-title" id="claims"><span>02</span><h2>Claims</h2><p>Assertions tied to evidence, attribution, and review.</p></div><div className="claims-table">{claims.map(([claimId, relation, kind, author, status], i) => <article className="public-claim" key={claimId}><div className="claim-year">{i === 0 ? "2018" : i === 1 ? "2019" : "1950"}</div><div className="public-claim-copy"><span className="public-claim-id">{claimId}</span><strong>{relation}</strong><span>{kind}</span><small>{author}</small><small>Evidence: original paper · Review: {status === "PROVEN" ? "Proven" : "Source confirmed"}</small></div><span className={`public-status ${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span></article>)}</div><div className="section-title lower-title" id="timeline"><span>03</span><h2>Timeline</h2><p>The frontier as it changed over time.</p></div><div className="history"><div><span>1950</span><strong>First lower bound established</strong><small>Erdős, Ko, and Rado</small></div><div><span>2018</span><strong>Construction reaches 5</strong><small>de Grey · Source confirmed</small></div><div><span>2019</span><strong>Upper bound improved to 7</strong><small>Exoo &amp; Ismailescu · Proven</small></div></div></div><aside className="canonical-aside"><div className="aside-block" id="specification"><span className="aside-label">Specification</span><h3>What question is being asked?</h3><p>{record.summary}</p><Link href="#claims">Read full specification <span>↗</span></Link></div><div className="aside-block" id="evidence"><span className="aside-label">Editorial status</span><h3>Evidence-backed record</h3><p>2 independent reviews completed. Current frontier accepted May 12, 2025.</p><div className="review-meter"><span /><span /></div><small>Human-reviewed · No AI-only claims</small></div><div className="aside-block citation"><span className="aside-label">Cite this Limit</span><code>Limits Registry. {record.id}. {record.title}. 2025.</code><button>Copy citation ↗</button></div></aside></section>
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><Link href="/">Back to Browse ↗</Link></footer>
  </main>;
}
