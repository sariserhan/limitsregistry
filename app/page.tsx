"use client";

import { useMemo, useState } from "react";

type Limit = {
  id: string;
  title: string;
  category: string;
  status: "OPEN" | "PROVEN";
  direction: "MAXIMIZE" | "MINIMIZE";
  summary: string;
  achievable: string;
  bound: string;
  gap: string;
  claims: number;
  papers: number;
};

const limits: Limit[] = [
  { id: "LR-000127", title: "Maximum edges in a triangle-free graph", category: "Graph theory", status: "PROVEN", direction: "MAXIMIZE", summary: "How dense can a graph be while containing no triangle?", achievable: "n² / 4", bound: "n² / 4", gap: "Closed", claims: 18, papers: 9 },
  { id: "LR-000114", title: "Shortest synchronizing word", category: "Automata", status: "OPEN", direction: "MINIMIZE", summary: "The shortest reset sequence for a synchronizing finite automaton.", achievable: "(n − 1)²", bound: "(n − 1)²", gap: "Open for n ≥ 3", claims: 24, papers: 17 },
  { id: "LR-000098", title: "Largest cap set in [3]ⁿ", category: "Combinatorics", status: "OPEN", direction: "MAXIMIZE", summary: "The largest subset of a grid containing no three points in a line.", achievable: "Θ(3ⁿ / n)", bound: "O(3ⁿ / n¹·⁶)", gap: "Asymptotic", claims: 31, papers: 22 },
  { id: "LR-000086", title: "Minimum distance of binary BCH codes", category: "Coding theory", status: "OPEN", direction: "MAXIMIZE", summary: "How much error separation can the construction guarantee?", achievable: "2t + 1", bound: "Unknown", gap: "Unbounded", claims: 12, papers: 8 },
  { id: "LR-000072", title: "Chromatic number of the plane", category: "Optimization", status: "OPEN", direction: "MINIMIZE", summary: "The fewest colors needed so that unit-distance points differ.", achievable: "5", bound: "7", gap: "2 colors", claims: 27, papers: 19 },
];

const claims = [
  { id: "CLM-000431", relation: "L ≥ 5", kind: "CONSTRUCTION", status: "SOURCE_CONFIRMED", source: "de Grey, 2018", detail: "A finite coloring establishes a lower bound under specification v2." },
  { id: "CLM-000208", relation: "L ≤ 7", kind: "UPPER_BOUND", status: "PROVEN", source: "Exoo & Ismailescu, 2019", detail: "Theorem 2 establishes the upper bound under specification v2." },
  { id: "CLM-000119", relation: "L ≥ 4", kind: "LOWER_BOUND", status: "PROVEN", source: "Erdős et al., 1950", detail: "The original construction remains valid under the current specification." },
];

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>; }
function ChevronIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>; }
function BookIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z" /><path d="M5 4.5v15a3 3 0 0 1 3-3h10" /></svg>; }

export default function Home() {
  const [selectedId, setSelectedId] = useState(limits[4].id);
  const [query, setQuery] = useState("");
  const [consoleMode, setConsoleMode] = useState(false);
  const [category, setCategory] = useState("All categories");
  const selected = limits.find((limit) => limit.id === selectedId) ?? limits[0];
  const filtered = useMemo(() => limits.filter((limit) => {
    const matchesQuery = `${limit.title} ${limit.category} ${limit.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || limit.category === category;
    return matchesQuery && matchesCategory;
  }), [query, category]);

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Limits Registry home"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></a>
      <nav className="topnav" aria-label="Primary navigation"><a className="active" href="#registry">Registry</a><a href="#open">Open Limits</a><a href="#about">About</a></nav>
      <button className={`console-switch ${consoleMode ? "selected" : ""}`} onClick={() => setConsoleMode(!consoleMode)}><span className="console-dot" />{consoleMode ? "Public Registry" : "Research Console"}<ChevronIcon /></button>
    </header>

    {consoleMode ? <section className="console-view" id="top">
      <div className="console-heading"><div><p className="section-kicker">Editorial workspace</p><h1>Research Console</h1><p>Turn source material into reviewable, evidence-backed Claims.</p></div><button className="primary-button">Add a source <ArrowIcon /></button></div>
      <div className="console-grid"><aside className="console-nav"><div className="console-nav-title">Workspace</div><button className="console-nav-item active"><GridIcon /> Review queue <span>08</span></button><button className="console-nav-item"><BookIcon /> Sources <span>142</span></button><button className="console-nav-item"><span className="tiny-icon">⌁</span> Claims <span>317</span></button><button className="console-nav-item"><span className="tiny-icon">◌</span> Entity resolution</button></aside><div className="queue-panel"><div className="panel-head"><div><h2>Claims awaiting review</h2><p>Prioritized by source quality and frontier impact.</p></div><span className="quiet-count">8 open</span></div>{["Maximum independent set in a planar graph", "Synchronizing word length under reset constraints", "Cap sets in the ternary grid"].map((name, i) => <button className="queue-row" key={name}><span className="queue-number">0{i + 1}</span><span className="queue-copy"><strong>{name}</strong><small>{i === 0 ? "UPPER_BOUND" : i === 1 ? "CONSTRUCTION" : "ASYMPTOTIC_BOUND"} · Paper evidence attached</small></span><span className="queue-status">Needs review <ChevronIcon /></span></button>)}</div></div>
    </section> : <>
      <section className="hero" id="top"><div className="hero-copy"><p className="section-kicker">A public record of known limits</p><h1>The verified boundaries<br />of what is possible.</h1><p className="hero-description">Limits Registry makes the frontier between achievement and impossibility legible — with sources, proofs, and the people behind every claim.</p><div className="search-wrap"><SearchIcon /><input aria-label="Search limits" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search limits, claims, papers…" /><kbd>⌘ K</kbd></div></div><div className="hero-rule"><span>01</span><span>Explore the registry</span><ArrowIcon /></div></section>
      <section className="registry-layout" id="registry"><aside className="sidebar"><div className="sidebar-label">Browse by field</div><button className={category === "All categories" ? "side-link active" : "side-link"} onClick={() => setCategory("All categories")}>All limits <span>{limits.length}</span></button>{["Combinatorics", "Graph theory", "Automata", "Coding theory", "Optimization"].map((item) => <button key={item} className={category === item ? "side-link active" : "side-link"} onClick={() => setCategory(item)}>{item}</button>)}<div className="sidebar-divider" /><div className="sidebar-label">Status</div><button className="side-link">Open limits <span className="amber">4</span></button><button className="side-link">Recently proven</button></aside><div className="registry-content"><div className="registry-heading"><div><p className="section-kicker">Curated registry</p><h2>Limits worth knowing</h2></div><div className="registry-meta"><span>25–40 launch records</span><span className="meta-divider" /><span>Updated today</span></div></div><div className="content-grid"><div className="limit-list">{filtered.map((limit) => <button className={`limit-row ${selected.id === limit.id ? "selected" : ""}`} onClick={() => setSelectedId(limit.id)} key={limit.id}><div className="limit-row-top"><span className="registry-id">{limit.id}</span><span className={`status ${limit.status.toLowerCase()}`}>{limit.status === "OPEN" ? "Open" : "Proven"}</span></div><h3>{limit.title}</h3><p>{limit.summary}</p><div className="limit-row-bottom"><span>{limit.category}</span><span>{limit.direction === "MAXIMIZE" ? "↗" : "↘"} {limit.direction.toLowerCase()}</span></div><ChevronIcon /></button>)}{filtered.length === 0 && <div className="empty-state"><strong>No limits found</strong><span>Try another search or category.</span></div>}</div><article className="limit-detail"><div className="detail-top"><span className="registry-id">{selected.id}</span><span className={`status ${selected.status.toLowerCase()}`}>{selected.status === "OPEN" ? "Open limit" : "Proven limit"}</span></div><h2>{selected.title}</h2><p className="detail-summary">{selected.summary}</p><a className="canonical-link" href={`/limits/${selected.id}`}>Open canonical Limit page <ArrowIcon /></a><div className="bound-block"><div className="bound-labels"><span>Achievable frontier</span><span>Proven bound</span></div><div className="bound-line"><div className="bound-value"><strong>{selected.achievable}</strong><small>best known</small></div><div className="bound-track"><span className={selected.status === "PROVEN" ? "closed" : ""} /><i /></div><div className="bound-value align-right"><strong>{selected.bound}</strong><small>{selected.status === "PROVEN" ? "exact" : "upper bound"}</small></div></div><div className="gap-callout"><span>Current gap</span><strong>{selected.gap}</strong></div></div><div className="detail-section"><div className="detail-section-head"><h3>Claims</h3><span>{selected.claims} total</span></div>{claims.map((claim) => <div className="claim-row" key={claim.id}><div className="claim-relation">{claim.relation}</div><div className="claim-main"><strong>{claim.kind.replaceAll("_", " ")}</strong><span>{claim.detail}</span><small>{claim.source}</small></div><span className={`claim-status ${claim.status === "PROVEN" ? "proven" : "confirmed"}`}>{claim.status.replaceAll("_", " ")}</span></div>)}</div><div className="detail-section timeline"><div className="detail-section-head"><h3>Timeline</h3><a href="#timeline">View all <ArrowIcon /></a></div><div className="timeline-item"><span className="timeline-year">1950</span><span className="timeline-dot" /><span><strong>First lower bound established</strong><small>Erdős, Ko, and Rado · Source confirmed</small></span></div><div className="timeline-item"><span className="timeline-year">2019</span><span className="timeline-dot" /><span><strong>Upper bound improved to 7</strong><small>Exoo &amp; Ismailescu · Proven</small></span></div></div></article></div></div></section>
    </>}
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><span>Built for the curious.</span></footer>
  </main>;
}
