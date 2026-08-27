"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { categorySlug } from "../src/domain/category";
import type { PublishedLimit } from "../src/domain/published";
import { formatExact } from "../src/domain/published";


import { PublicHeader } from "../src/components/public-header";

type BrowseClientProps = { initialLimits: PublishedLimit[] };


function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>; }
function ChevronIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>; }
function BookIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z" /><path d="M5 4.5v15a3 3 0 0 1 3-3h10" /></svg>; }

export default function Home({ initialLimits }: BrowseClientProps) {
  const limits = initialLimits;
  const [selectedId, setSelectedId] = useState(limits[4]?.id ?? limits[0]?.id);
  const [query, setQuery] = useState("");
  const consoleMode = false;
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState<"ALL" | PublishedLimit["status"]>("ALL");
  const [page, setPage] = useState(1);
  const categories = useMemo(() => Array.from(limits.reduce((counts, limit) => counts.set(limit.category, (counts.get(limit.category) ?? 0) + 1), new Map<string, number>())).sort(([left], [right]) => left.localeCompare(right)), [limits]);
  const statuses = useMemo(() => Array.from(limits.reduce((counts, limit) => counts.set(limit.status, (counts.get(limit.status) ?? 0) + 1), new Map<PublishedLimit["status"], number>())).sort(([left], [right]) => left.localeCompare(right)), [limits]);
  const selected = limits.find((limit) => limit.id === selectedId) ?? limits[0];
  const filtered = useMemo(() => limits.filter((limit) => {
    const matchesQuery = `${limit.title} ${limit.category} ${limit.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || limit.category === category;
    const matchesStatus = status === "ALL" || limit.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  }).sort((left, right) => {
    const dateDifference = (Date.parse(right.publishedAt ?? "") || 0) - (Date.parse(left.publishedAt ?? "") || 0);
    return dateDifference || left.id.localeCompare(right.id);
  }), [limits, query, category, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pageCount);
  const visibleLimits = filtered.slice((currentPage - 1) * 6, currentPage * 6);

  return <main className="app-shell">
    <PublicHeader large />

    {consoleMode ? <section className="console-view" id="top">
      <div className="console-heading"><div><p className="section-kicker">Editorial workspace</p><h1>Research Console</h1><p>Turn source material into reviewable, evidence-backed Claims.</p></div><button className="primary-button">Add a source <ArrowIcon /></button></div>
      <div className="console-grid"><aside className="console-nav"><div className="console-nav-title">Workspace</div><button className="console-nav-item active"><GridIcon /> Review queue <span>08</span></button><button className="console-nav-item"><BookIcon /> Sources <span>142</span></button><button className="console-nav-item"><span className="tiny-icon">⌁</span> Claims <span>317</span></button><button className="console-nav-item"><span className="tiny-icon">◌</span> Entity resolution</button></aside><div className="queue-panel"><div className="panel-head"><div><h2>Claims awaiting review</h2><p>Prioritized by source quality and frontier impact.</p></div><span className="quiet-count">8 open</span></div>{["Maximum independent set in a planar graph", "Synchronizing word length under reset constraints", "Cap sets in the ternary grid"].map((name, i) => <button className="queue-row" key={name}><span className="queue-number">0{i + 1}</span><span className="queue-copy"><strong>{name}</strong><small>{i === 0 ? "UPPER_BOUND" : i === 1 ? "CONSTRUCTION" : "ASYMPTOTIC_BOUND"} · Paper evidence attached</small></span><span className="queue-status">Needs review <ChevronIcon /></span></button>)}</div></div>
    </section> : <>
      <section className="hero" id="top"><div className="hero-copy"><p className="section-kicker">A public record of known limits</p><h1>The verified boundaries<br />of what is possible.</h1><p className="hero-description">Limits Registry makes the frontier between achievement and impossibility legible — with sources, proofs, and the people behind every claim.</p><div className="search-wrap"><SearchIcon /><input aria-label="Search limits" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search limits, claims, papers…" /><kbd>⌘ K</kbd></div></div><div className="hero-rule"><span>01</span><span>Explore the registry</span><ArrowIcon /></div></section>
      <section className="registry-layout" id="registry"><aside className="sidebar"><div className="sidebar-label">Browse by field</div><button className={category === "All categories" ? "side-link active" : "side-link"} onClick={() => { setCategory("All categories"); setPage(1); }}>All limits <span>{limits.length}</span></button>{categories.map(([item, count]) => <div className="side-field" key={item}><button className={category === item ? "side-link active" : "side-link"} onClick={() => { setCategory(item); setPage(1); }}>{item}<span>{count}</span></button><Link aria-label={"View all " + item + " records"} href={"/categories/" + categorySlug(item)}>↗</Link></div>)}<div className="sidebar-divider" /><div className="sidebar-label">Status</div><button className={status === "ALL" ? "side-link active" : "side-link"} onClick={() => { setStatus("ALL"); setPage(1); }}>All statuses <span>{limits.length}</span></button>{statuses.map(([item, count]) => <button key={item} className={status === item ? "side-link active" : "side-link"} onClick={() => { setStatus(item); setPage(1); }}>{item.replaceAll("_", " ")} <span>{count}</span></button>)}</aside><div className="registry-content"><div className="registry-heading"><div><p className="section-kicker">Curated registry</p><h2>Limits worth knowing</h2></div><div className="registry-meta"><span>Curated registry</span><span className="meta-divider" /><span>Updated today</span></div></div><div className="content-grid"><div className="limit-list">{visibleLimits.map((limit) => <button className={`limit-row ${selected.id === limit.id ? "selected" : ""}`} onClick={() => setSelectedId(limit.id)} key={limit.id}><div className="limit-row-top"><span className="registry-id">{limit.id}</span><span className={`status ${limit.status.toLowerCase()}`}>{limit.status.replaceAll("_", " ")}</span></div><h3>{limit.title}</h3><p>{limit.summary}</p><div className="limit-row-bottom"><span>{limit.category}</span><span>{limit.direction === "MAXIMIZE" ? "↗" : "↘"} {limit.direction.toLowerCase()}</span></div><ChevronIcon /></button>)}{filtered.length === 0 && <div className="empty-state"><strong>No limits found</strong><span>Try another search or category.</span></div>}{filtered.length > 0 && <nav className="pagination" aria-label="Registry pages"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount} · {filtered.length} records</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></nav>}</div><article className="limit-detail"><div className="detail-top"><span className="registry-id">{selected.id}</span><span className={`status ${selected.status.toLowerCase()}`}>{selected.status.replaceAll("_", " ")} limit</span></div><h2>{selected.title}</h2><p className="detail-summary">{selected.summary}</p><a className="canonical-link" href={`/limits/${selected.id}`}>Open canonical Limit page <ArrowIcon /></a><div className="bound-block"><div className="bound-labels"><span>{selected.direction === "MINIMIZE" ? "Proven lower bound" : "Best known lower bound"}</span><span>{selected.direction === "MINIMIZE" ? "Best known upper bound" : "Proven upper bound"}</span></div><div className="bound-line"><div className="bound-value"><strong>{formatExact(selected.frontier.achievable)}</strong><small>{selected.direction === "MINIMIZE" ? "proven lower bound" : "best known lower bound"}</small></div><div className="bound-track"><span className={selected.frontier.status === "PROVEN" ? "closed" : ""} /><i /></div><div className="bound-value align-right"><strong>{formatExact(selected.direction === "MAXIMIZE" ? selected.frontier.upperBound : selected.frontier.lowerBound)}</strong><small>{selected.direction === "MINIMIZE" ? "best known upper bound" : "proven upper bound"}</small></div></div><div className="gap-callout"><span>Gap</span><strong>{selected.frontier.gap}</strong></div></div><div className="detail-section"><div className="detail-section-head"><h3>Claims</h3><span>{selected.claims} total</span></div>{selected.claimsData.length ? selected.claimsData.map((claim) => <div className="claim-row" key={claim.id}><div className="claim-relation">{claim.relation} {formatExact(claim.value)}</div><div className="claim-main"><strong>{claim.claimType.replaceAll("_", " ")}</strong><span>{claim.methodSummary ?? "No method summary recorded."}</span><small>{claim.source} · {claim.year}</small></div><span className="claim-status confirmed">{claim.epistemicStatus.replaceAll("_", " ")}</span></div>) : <div className="empty-state"><strong>No accepted Claims</strong><span>This record has no accepted Claims in its current specification.</span></div>}</div><div className="detail-section timeline"><div className="detail-section-head"><h3>Timeline</h3><a href="#timeline">View all <ArrowIcon /></a></div>{selected.timelineData?.length ? selected.timelineData.map((event) => <div className="timeline-item" key={event.id}><span className="timeline-year">{event.occurredAt.slice(0, 4)}</span><span className="timeline-dot" /><span><strong>{event.title}</strong><small>{event.description ?? event.occurredAt.slice(0, 10)}</small></span></div>) : <div className="empty-state"><strong>No timeline events</strong><span>No public history has been recorded for this Limit.</span></div>}</div></article></div></div></section>
    </>}
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><span className="footer-links"><a href="/about">About</a><a href="/editorial-policy">Editorial policy</a><a href="/support">Support</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span></footer>
  </main>;
}
