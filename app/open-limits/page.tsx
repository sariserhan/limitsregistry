import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listPublicCategories } from "../../src/db/repository";
import { listPublicLimitPage } from "../../src/db/repository.public-limits";

export const revalidate = 60;
export const metadata: Metadata = { title: "Open Limits — Limits Registry", description: "Published Limits whose accepted Claims still leave a genuine unknown gap." };

type Props = { searchParams: Promise<{ page?: string; q?: string; field?: string; sort?: string }> };

export default async function OpenLimitsPage({ searchParams }: Props) {
  const query = await searchParams;
  const search = (query.q ?? "").trim();
  const fieldNames = await listPublicCategories();
  const categories = fieldNames.length;
  const field = fieldNames.includes(query.field ?? "") ? query.field ?? "" : "";
  const sort = ["name-asc", "name-desc", "date-newest", "date-oldest"].includes(query.sort ?? "") ? query.sort ?? "name-asc" : "name-asc";
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const sortOption = sort === "name-asc" ? "alphabetical" : sort === "name-desc" ? "alphabetical-desc" : sort === "date-oldest" ? "oldest" : "newest";
  const data = await listPublicLimitPage({ page: Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1, pageSize: 50, query: search, category: field, status: "OPEN", sort: sortOption });
  const { rows: visibleRows, total, page, pageCount } = data;
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (field) params.set("field", field);
    if (sort !== "name-asc") params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const queryString = params.toString();
    return queryString ? `/open-limits?${queryString}` : "/open-limits";
  };
  return <main className="directory-page">
    <PublicHeader />
    <section className="directory-intro"><p className="section-kicker">Unresolved frontiers</p><h1>Open Limits.</h1><p>Problems where accepted Claims establish part of the frontier, but the current specification still contains a genuine unknown gap.</p><div className="directory-stats"><span><strong>{total}</strong> published open records</span><span><strong>{categories}</strong> fields represented</span></div></section>
    <section className="page-explanation" aria-labelledby="open-limits-read-title"><div><p className="section-kicker">How to read this page</p><h2 id="open-limits-read-title">Open means the gap is real.</h2><p>These are published records where accepted Claims do not yet close the current specification. “Open” describes the frontier, not the quality of the work around it.</p></div><div className="page-explanation-grid"><article><strong>Published first</strong><p>Every row is public and has passed the Registry’s publication requirements. Draft records are not listed here.</p></article><article><strong>Unknown gap</strong><p>An open Limit has known results on at least part of the question, but its strongest lower and upper bounds still do not meet.</p></article><article><strong>Challenge it</strong><p>Open a canonical page to inspect the scope, evidence, and challenge controls for proposing a stronger bound.</p></article></div></section>
    <section className="open-limits-controls" aria-label="Search and filter open Limits"><form method="get"><label><span>Search</span><input type="search" name="q" defaultValue={search} placeholder="Search title, field, or registry number" /></label><label><span>Field</span><select name="field" defaultValue={field}><option value="">All fields</option>{fieldNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label><span>Sort by</span><select name="sort" defaultValue={sort}><option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="date-newest">Newest first</option><option value="date-oldest">Oldest first</option></select></label><button type="submit">Apply filters</button>{search || field || sort !== "name-asc" ? <Link href="/open-limits">Clear</Link> : null}</form><p>{total} matching {total === 1 ? "Limit" : "Limits"}{search || field ? " - refine the frontier" : ""}</p></section>
    <section className="directory-list" aria-label="Open Limits">{total ? <>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small>{limit.category} &middot; {limit.direction.toLowerCase()} &middot; {limit.publishedAt ? new Date(limit.publishedAt).toLocaleDateString() : "Date unavailable"}</small><b aria-hidden="true">&rarr;</b></Link>)}{pageCount > 1 ? <nav className="directory-pagination" aria-label="Open Limits pages"><Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={pageHref(item)} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link></nav> : null}</> : <div className="directory-empty"><strong>{total ? "No open Limits match these filters." : "No open Limits are published yet."}</strong><p>{total ? "Try a broader search or choose another field." : "Draft records remain private until their Claims, evidence, and independent reviews are accepted."}</p>{total ? <Link href="/open-limits">Clear filters</Link> : <Link href="/about">How publication works &rarr;</Link>}</div>}</section>
    <SiteFooter />
  </main>;
}
