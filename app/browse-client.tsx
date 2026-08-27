"use client";

import { useMemo, useState } from "react";
import type { PublishedLimit } from "../src/domain/published";
import { formatExact } from "../src/domain/published";


import { BrandIcon } from "../src/components/brand-icon";

type BrowseClientProps = { initialLimits: PublishedLimit[]; initialClaims: typeof import("../src/domain/registry").browseClaims };


function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>; }
function ChevronIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>; }
function BookIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z" /><path d="M5 4.5v15a3 3 0 0 1 3-3h10" /></svg>; }

export default function Home({ initialLimits, initialClaims }: BrowseClientProps) {
  const limits = initialLimits;
  const claims = initialClaims;
  const [selectedId, setSelectedId] = useState(limits[4]?.id ?? limits[0]?.id);
  const [query, setQuery] = useState("");
  const consoleMode = false;
  const [category, setCategory] = useState("All categories");
  const selected = limits.find((limit) => limit.id === selectedId) ?? limits[0];
  const filtered = useMemo(() => limits.filter((limit) => {
    const matchesQuery = `${limit.title} ${limit.category} ${limit.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || limit.category === category;
    return matchesQuery && matchesCategory;
  }), [limits, query, category]);

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Limits Registry home"><BrandIcon className="brand-mark" /><span>Limits Registry</span></a>
      <nav className="topnav" aria-label="Primary navigation"><a className="active" href="#registry">Registry</a><a href="#open">Open Limits</a><a href="/search">Search</a><a href="/dependencies">Graph</a><a href="/bounties">Bounties</a><a href="/watchlists">Watchlists</a><a href="#about">About</a></nav>
      <a className="console-switch" href="/console"><span className="console-dot" />Research Console<ChevronIcon /></a>
    </header>

    {consoleMode ? <section className="console-view" id="top">
      <div className="console-heading"><div><p className="section-kicker">Editorial workspace</p><h1>Research Console</h1><p>Turn source material into reviewable, evidence-backed Claims.</p></div><button className="primary-button">Add a source <ArrowIcon /></button></div>
      <div className="console-grid"><aside className="console-nav"><div className="console-nav-title">Workspace</div><button className="console-nav-item active"><GridIcon /> Review queue <span>08</span></button><button className="console-nav-item"><BookIcon /> Sources <span>142</span></button><button className="console-nav-item"><span className="tiny-icon">⌁</span> Claims <span>317</span></button><button className="console-nav-item"><span className="tiny-icon">◌</span> Entity resolution</button></aside><div className="queue-panel"><div className="panel-head"><div><h2>Claims awaiting review</h2><p>Prioritized by source quality and frontier impact.</p></div><span className="quiet-count">8 open</span></div>{["Maximum independent set in a planar graph", "Synchronizing word length under reset constraints", "Cap sets in the ternary grid"].map((name, i) => <button className="queue-row" key={name}><span className="queue-number">0{i + 1}</span><span className="queue-copy"><strong>{name}</strong><small>{i === 0 ? "UPPER_BOUND" : i === 1 ? "CONSTRUCTION" : "ASYMPTOTIC_BOUND"} · Paper evidence attached</small></span><span className="queue-status">Needs review <ChevronIcon /></span></button>)}</div></div>
    </section> : <>
      <section className="hero" id="top"><div className="hero-copy"><p className="section-kicker">A public record of known limits</p><h1>The verified boundaries<br />of what is possible.</h1><p className="hero-description">Limits Registry makes the frontier between achievement and impossibility legible — with sources, proofs, and the people behind every claim.</p><div className="search-wrap"><SearchIcon /><input aria-label="Search limits" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search limits, claims, papers…" /><kbd>⌘ K</kbd></div></div><div className="hero-rule"><span>01</span><span>Explore the registry</span><ArrowIcon /></div></section>
      <section className="registry-layout" id="registry"><aside className="sidebar"><div className="sidebar-label">Browse by field</div><button className={category === "All categories" ? "side-link active" : "side-link"} onClick={() => setCategory("All categories")}>All limits <span>{limits.length}</span></button>{["Combinatorics", "Graph theory", "Automata", "Coding theory", "Optimization"].map((item) => <button key={item} className={category === item ? "side-link active" : "side-link"} onClick={() => setCategory(item)}>{item}</button>)}<div className="sidebar-divider" /><div className="sidebar-label">Status</div><button className="side-link">Open limits <span className="amber">4</span></button><button className="side-link">Recently proven</button></aside><div className="registry-content"><div className="registry-heading"><div><p className="section-kicker">Curated registry</p><h2>Limits worth knowing</h2></div><div className="registry-meta"><span>Curated registry</span><span className="meta-divider" /><span>Updated today</span></div></div><div className="content-grid"><div className="limit-list">{filtered.map((limit) => <button className={`limit-row ${selected.id === limit.id ? "selected" : ""}`} onClick={() => setSelectedId(limit.id)} key={limit.id}><div className="limit-row-top"><span className="registry-id">{limit.id}</span><span className={`status ${limit.frontier.status.toLowerCase()}`}>{limit.frontier.status === "OPEN" ? "Open" : "Proven"}</span></div><h3>{limit.title}</h3><p>{limit.summary}</p><div className="limit-row-bottom"><span>{limit.category}</span><span>{limit.direction === "MAXIMIZE" ? "↗" : "↘"} {limit.direction.toLowerCase()}</span></div><ChevronIcon /></button>)}{filtered.length === 0 && <div className="empty-state"><strong>No limits found</strong><span>Try another search or category.</span></div>}</div><article className="limit-detail"><div className="detail-top"><span className="registry-id">{selected.id}</span><span className={`status ${selected.frontier.status.toLowerCase()}`}>{selected.frontier.status === "OPEN" ? "Open limit" : "Proven limit"}</span></div><h2>{selected.title}</h2><p className="detail-summary">{selected.summary}</p><a className="canonical-link" href={`/limits/${selected.id}`}>Open canonical Limit page <ArrowIcon /></a><div className="bound-block"><div className="bound-labels"><span>{selected.direction === "MINIMIZE" ? "Proven lower bound" : "Best known lower bound"}</span><span>{selected.direction === "MINIMIZE" ? "Best known upper bound" : "Proven upper bound"}</span></div><div className="bound-line"><div className="bound-value"><strong>{formatExact(selected.frontier.achievable)}</strong><small>{selected.direction === "MINIMIZE" ? "proven lower bound" : "best known lower bound"}</small></div><div className="bound-track"><span className={selected.frontier.status === "PROVEN" ? "closed" : ""} /><i /></div><div className="bound-value align-right"><strong>{formatExact(selected.direction === "MAXIMIZE" ? selected.frontier.upperBound : selected.frontier.lowerBound)}</strong><small>{selected.direction === "MINIMIZE" ? "best known upper bound" : "proven upper bound"}</small></div></div><div className="gap-callout"><span>Gap</span><strong>{selected.frontier.gap}</strong></div></div><div className="detail-section"><div className="detail-section-head"><h3>Claims</h3><span>{selected.claims} total</span></div>{claims.map((claim) => <div className="claim-row" key={claim.id}><div className="claim-relation">{claim.relation}</div><div className="claim-main"><strong>{claim.kind.replaceAll("_", " ")}</strong><span>{claim.detail}</span><small>{claim.source}</small></div><span className={`claim-status ${claim.status === "PROVEN" ? "proven" : "confirmed"}`}>{claim.status.replaceAll("_", " ")}</span></div>)}</div><div className="detail-section timeline"><div className="detail-section-head"><h3>Timeline</h3><a href="#timeline">View all <ArrowIcon /></a></div><div className="timeline-item"><span className="timeline-year">1950</span><span className="timeline-dot" /><span><strong>First lower bound established</strong><small>Erdős, Ko, and Rado · Source confirmed</small></span></div><div className="timeline-item"><span className="timeline-year">2019</span><span className="timeline-dot" /><span><strong>Upper bound improved to 7</strong><small>Exoo &amp; Ismailescu · Proven</small></span></div></div></article></div></div></section>
    </>}
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><span className="footer-links"><a href="/about">About</a><a href="/editorial-policy">Editorial policy</a><a href="/support">Support</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span></footer>
  </main>;
}
