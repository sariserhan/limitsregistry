"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categorySlug } from "../src/domain/category";
import type { PublishedLimit } from "../src/domain/published";
import { formatExact } from "../src/domain/published";


import { PublicHeader } from "../src/components/public-header";
import { SiteFooter } from "../src/components/site-footer";

type RegistryStats = { limitCount: number; evidenceCount: number; categoryCount: number; sourceCount: number };
type RecentBreakthrough = { id: string; registryNumber: string; eventType: string; occurredAt: string };
type FeaturedBounty = { id: string; title: string; sponsor: string; amount: string | null; currency: string | null; registryNumber: string };
type FeaturedArticle = { slug: string; title: string; dek: string };
type BrowseClientProps = { initialLimits: PublishedLimit[]; stats: RegistryStats | null; recentBreakthroughs: RecentBreakthrough[]; featuredBounties: FeaturedBounty[]; featuredArticles: FeaturedArticle[] };

const BREAKTHROUGH_LABEL: Record<string, string> = { STRONGER_BOUND: "Stronger bound accepted", FRONTIER_CLOSED: "Frontier closed" };
const bountyAmount = (amount: string | null, currency: string | null) => amount && currency ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(amount))} ${currency}` : "Amount not specified";


function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>; }
function ChevronIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>; }
function BookIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z" /><path d="M5 4.5v15a3 3 0 0 1 3-3h10" /></svg>; }

function BrowseFrontier({ limit }: { limit: PublishedLimit }) {
  const presentation = limit.frontierPresentation ?? { mode: "INTERVAL" as const };
  if (presentation.mode === "SINGLE_VALUE") return <div className="bound-block bound-single"><span>{presentation.label}</span><strong>{formatExact(presentation.value)}</strong><p>{presentation.note}</p></div>;
  if (presentation.mode === "ONE_SIDED") return <div className="bound-block"><div className="bound-labels"><span>Known lower bound</span><span>Known upper bound</span></div><div className="bound-line"><div className="bound-value"><strong>{limit.frontier.lowerBound ? formatExact(limit.frontier.lowerBound) : "Unknown"}</strong><small>lower bound</small></div><div className="bound-track"><span /><i /></div><div className="bound-value align-right"><strong>{limit.frontier.upperBound ? formatExact(limit.frontier.upperBound) : "Unknown"}</strong><small>upper bound</small></div></div><div className="gap-callout"><span>Gap</span><strong>Open / unknown</strong></div></div>;
  return <div className="bound-block"><div className="bound-labels"><span>{limit.direction === "MINIMIZE" ? "Proven lower bound" : "Best known lower bound"}</span><span>{limit.direction === "MINIMIZE" ? "Best known upper bound" : "Proven upper bound"}</span></div><div className="bound-line"><div className="bound-value"><strong>{formatExact(limit.frontier.lowerBound)}</strong><small>{limit.direction === "MINIMIZE" ? "proven lower bound" : "best known lower bound"}</small></div><div className="bound-track"><span className={limit.frontier.status === "PROVEN" ? "closed" : ""} /><i /></div><div className="bound-value align-right"><strong>{formatExact(limit.frontier.upperBound)}</strong><small>{limit.direction === "MINIMIZE" ? "best known upper bound" : "proven upper bound"}</small></div></div><div className="gap-callout"><span>Gap</span><strong>{limit.frontier.gap}</strong></div></div>;
}

export default function Home({ initialLimits, stats, recentBreakthroughs, featuredBounties, featuredArticles }: BrowseClientProps) {
  const limits = initialLimits;
  const [selectedId, setSelectedId] = useState(limits[4]?.id ?? limits[0]?.id);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  // The visible "⌘ K" hint next to the search box did nothing without this — Cmd+K (or Ctrl+K on
  // non-Mac) focuses the search input, matching the shortcut every other site with this hint uses.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
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
  const pageSize = 3;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleLimits = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const fieldPageHref = category === "All categories" ? "/categories/all" : "/categories/" + categorySlug(category);

  return <main className="app-shell">
    <PublicHeader />

    {consoleMode ? <section className="console-view" id="top">
      <div className="console-heading"><div><p className="section-kicker">Editorial workspace</p><h1>Research Console</h1><p>Turn source material into reviewable, evidence-backed Claims.</p></div><button className="primary-button">Add a source <ArrowIcon /></button></div>
      <div className="console-grid"><aside className="console-nav"><div className="console-nav-title">Workspace</div><button className="console-nav-item active"><GridIcon /> Review queue <span>08</span></button><button className="console-nav-item"><BookIcon /> Sources <span>142</span></button><button className="console-nav-item"><span className="tiny-icon">⌁</span> Claims <span>317</span></button><button className="console-nav-item"><span className="tiny-icon">◌</span> Entity resolution</button></aside><div className="queue-panel"><div className="panel-head"><div><h2>Claims awaiting review</h2><p>Prioritized by source quality and frontier impact.</p></div><span className="quiet-count">8 open</span></div>{["Maximum independent set in a planar graph", "Synchronizing word length under reset constraints", "Cap sets in the ternary grid"].map((name, i) => <button className="queue-row" key={name}><span className="queue-number">0{i + 1}</span><span className="queue-copy"><strong>{name}</strong><small>{i === 0 ? "UPPER_BOUND" : i === 1 ? "CONSTRUCTION" : "ASYMPTOTIC_BOUND"} · Paper evidence attached</small></span><span className="queue-status">Needs review <ChevronIcon /></span></button>)}</div></div>
    </section> : <>
      <section className="hero" id="top"><div className="hero-copy"><p className="section-kicker">A public record of known limits</p><h1>The verified boundaries<br />of what is possible.</h1><p className="hero-description">Limits Registry makes the frontier between achievement and impossibility legible — with sources, proofs, and the people behind every claim.</p><div className="search-wrap"><SearchIcon /><input ref={searchInputRef} aria-label="Search limits" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search limits, claims, papers…" /><kbd>⌘ K</kbd></div></div><Link className="hero-certificate" href="/certificates/preview"><div className="hero-certificate-mark"><Image src="/icon-no-bg.png" width={112} height={102} alt="Limits Registry certificate seal" priority /></div><div className="hero-certificate-copy"><span>Certificate preview</span><strong>See a verified record</strong><small>What an approved Claim receives <ArrowIcon /></small></div></Link><a className="hero-rule" href="#registry"><span>01</span><span>Explore the registry</span><ArrowIcon /></a></section>
      {stats ? <section className="trust-strip"><div className="stat"><strong>{stats.limitCount.toLocaleString()}</strong><span>Published limits</span></div><div className="stat"><strong>{stats.evidenceCount.toLocaleString()}</strong><span>Evidence records</span></div><div className="stat"><strong>{stats.categoryCount.toLocaleString()}</strong><span>Domains covered</span></div><div className="stat"><strong>{stats.sourceCount.toLocaleString()}</strong><span>Primary sources</span></div><div className="trust-links"><Link href="/methodology">Methodology ↗</Link><small>How a record gets published</small></div></section> : null}
      {recentBreakthroughs.length || featuredBounties.length || featuredArticles.length ? <section className="home-teasers">
        <div className="home-teaser"><div className="home-teaser-head"><span className="section-kicker">Recent activity</span><Link href="/breakthroughs">All breakthroughs ↗</Link></div>{recentBreakthroughs.length ? recentBreakthroughs.map((event) => <Link className="home-teaser-row" href={`/limits/${event.registryNumber}`} key={event.id}><strong>{event.registryNumber}</strong><span>{BREAKTHROUGH_LABEL[event.eventType] ?? event.eventType}</span><small>{event.occurredAt.slice(0, 10)}</small></Link>) : <p className="home-teaser-empty">No breakthroughs recorded yet.</p>}</div>
        <div className="home-teaser"><div className="home-teaser-head"><span className="section-kicker">Verified bounties</span><Link href="/bounties">All bounties ↗</Link></div>{featuredBounties.length ? featuredBounties.map((bounty) => <Link className="home-teaser-row" href={`/limits/${bounty.registryNumber}`} key={bounty.id}><strong>{bounty.title}</strong><span>{bountyAmount(bounty.amount, bounty.currency)}</span><small>{bounty.sponsor}</small></Link>) : <p className="home-teaser-empty">No verified bounties yet.</p>}</div>
        <div className="home-teaser"><div className="home-teaser-head"><span className="section-kicker">Articles</span><Link href="/articles">All articles ↗</Link></div>{featuredArticles.length ? featuredArticles.map((article) => <Link className="home-teaser-row article-teaser-row" href={`/articles/${article.slug}`} key={article.slug}><strong>{article.title}</strong><small>{article.dek}</small></Link>) : <p className="home-teaser-empty">No articles published yet.</p>}</div>
      </section> : null}
      <section className="registry-layout" id="registry"><aside className="sidebar"><div className="sidebar-label">Browse by field</div><button className={category === "All categories" ? "side-link active" : "side-link"} onClick={() => { setCategory("All categories"); setPage(1); }}>All limits <span>{limits.length}</span></button>{categories.map(([item, count]) => <div className="side-field" key={item}><button className={category === item ? "side-link active" : "side-link"} onClick={() => { setCategory(item); setPage(1); }}>{item}<span>{count}</span></button><Link aria-label={"View all " + item + " records"} href={"/categories/" + categorySlug(item)}>↗</Link></div>)}<div className="sidebar-divider" /><div className="sidebar-label">Status</div><button className={status === "ALL" ? "side-link active" : "side-link"} onClick={() => { setStatus("ALL"); setPage(1); }}>All statuses <span>{limits.length}</span></button>{statuses.map(([item, count]) => <button key={item} className={status === item ? "side-link active" : "side-link"} onClick={() => { setStatus(item); setPage(1); }}>{item.replaceAll("_", " ")} <span>{count}</span></button>)}</aside><div className="registry-content"><div className="registry-heading"><div><p className="section-kicker">Curated registry</p><h2><Link href={fieldPageHref}>{category === "All categories" ? "All limits" : category} <span aria-hidden="true">↗</span></Link></h2></div><div className="registry-meta"><span>Curated registry</span><span className="meta-divider" /><span>Updated today</span></div></div><div className="content-grid"><div className="limit-list">{visibleLimits.map((limit) => <button className={`limit-row ${selected.id === limit.id ? "selected" : ""}`} onClick={() => setSelectedId(limit.id)} key={limit.id}><div className="limit-row-top"><span className="registry-id">{limit.id}</span><span className={`status ${limit.status.toLowerCase()}`}>{limit.status.replaceAll("_", " ")}</span></div><h3>{limit.title}</h3><p>{limit.summary}</p><div className="limit-row-bottom"><span>{limit.category}</span><span>{limit.direction === "MAXIMIZE" ? "↗" : "↘"} {limit.direction.toLowerCase()}</span></div><ChevronIcon /></button>)}{filtered.length === 0 && <div className="empty-state"><strong>No limits found</strong><span>Try another search or category.</span></div>}{filtered.length > 0 && <nav className="pagination" aria-label="Registry pages"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount} · {filtered.length} records</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></nav>}</div><article className="limit-detail"><div className="detail-top"><span className="registry-id">{selected.id}</span><span className={`status ${selected.status.toLowerCase()}`}>{selected.status.replaceAll("_", " ")} limit</span></div><h2>{selected.title}</h2><p className="detail-summary">{selected.summary}</p><a className="canonical-link" href={`/limits/${selected.id}`}>Open canonical Limit page <ArrowIcon /></a><BrowseFrontier limit={selected} /><div className="detail-section"><div className="detail-section-head"><h3>Claims</h3><span>{selected.claims} total</span></div>{selected.claimsData.length ? selected.claimsData.map((claim) => <div className="claim-row" key={claim.id}><div className="claim-relation">{claim.relation} {formatExact(claim.value)}</div><div className="claim-main"><strong>{claim.claimType.replaceAll("_", " ")}</strong><span>{claim.methodSummary ?? "No method summary recorded."}</span><small>{claim.source} · {claim.year}</small></div><span className="claim-status confirmed">{claim.epistemicStatus.replaceAll("_", " ")}</span></div>) : <div className="empty-state"><strong>No accepted Claims</strong><span>This record has no accepted Claims in its current specification.</span></div>}</div><div className="detail-section timeline"><div className="detail-section-head"><h3>Timeline</h3><a href="#timeline">View all <ArrowIcon /></a></div>{selected.timelineData?.length ? selected.timelineData.map((event) => <div className="timeline-item" key={event.id}><span className="timeline-year">{event.occurredAt.slice(0, 4)}</span><span className="timeline-dot" /><span><strong>{event.title}</strong><small>{event.description ?? event.occurredAt.slice(0, 10)}</small></span></div>) : <div className="empty-state"><strong>No timeline events</strong><span>No public history has been recorded for this Limit.</span></div>}</div></article></div></div></section>
    </>}
    <SiteFooter />
  </main>;
}
