import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listPublishedLimits } from "../../src/db/repository";

export const revalidate = 60;
export const metadata: Metadata = { title: "Open Limits — Limits Registry", description: "Published Limits whose accepted Claims still leave a genuine unknown gap." };

const PAGE_SIZE = 50;
type Props = { searchParams: Promise<{ page?: string; q?: string; field?: string; sort?: string }> };

export default async function OpenLimitsPage({ searchParams }: Props) {
  let rows: Awaited<ReturnType<typeof listPublishedLimits>> = [];
  try { rows = (await listPublishedLimits()).filter((limit) => limit.status === "OPEN"); } catch { rows = []; }
  const fieldNames = Array.from(new Set(rows.map((limit) => limit.category))).sort((a, b) => a.localeCompare(b));
  const query = await searchParams;
  const search = (query.q ?? "").trim();
  const field = fieldNames.includes(query.field ?? "") ? query.field ?? "" : "";
  const sort = ["name-asc", "name-desc", "date-newest", "date-oldest"].includes(query.sort ?? "") ? query.sort ?? "name-asc" : "name-asc";
  const filteredRows = rows.filter((limit) => {
    const haystack = `${limit.title} ${limit.summary} ${limit.registryNumber} ${limit.category}`.toLocaleLowerCase();
    return (!search || haystack.includes(search.toLocaleLowerCase())) && (!field || limit.category === field);
  });
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sort.startsWith("name")) {
      const result = a.title.localeCompare(b.title);
      return sort === "name-desc" ? -result : result;
    }
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    const result = aDate - bDate || a.title.localeCompare(b.title);
    return sort === "date-newest" ? -result : result;
  });
  const categories = fieldNames.length;
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleRows = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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
    <section className="directory-intro"><p className="section-kicker">Unresolved frontiers</p><h1>Open Limits.</h1><p>Problems where accepted Claims establish part of the frontier, but the current specification still contains a genuine unknown gap.</p><div className="directory-stats"><span><strong>{rows.length}</strong> published open records</span><span><strong>{categories}</strong> fields represented</span></div></section>
    <section className="page-explanation" aria-labelledby="open-limits-read-title"><div><p className="section-kicker">How to read this page</p><h2 id="open-limits-read-title">Open means the gap is real.</h2><p>These are published records where accepted Claims do not yet close the current specification. “Open” describes the frontier, not the quality of the work around it.</p></div><div className="page-explanation-grid"><article><strong>Published first</strong><p>Every row is public and has passed the Registry’s publication requirements. Draft records are not listed here.</p></article><article><strong>Unknown gap</strong><p>An open Limit has known results on at least part of the question, but its strongest lower and upper bounds still do not meet.</p></article><article><strong>Challenge it</strong><p>Open a canonical page to inspect the scope, evidence, and challenge controls for proposing a stronger bound.</p></article></div></section>
    <section className="open-limits-controls" aria-label="Search and filter open Limits"><form method="get"><label><span>Search</span><input type="search" name="q" defaultValue={search} placeholder="Search title, field, or registry number" /></label><label><span>Field</span><select name="field" defaultValue={field}><option value="">All fields</option>{fieldNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label><span>Sort by</span><select name="sort" defaultValue={sort}><option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="date-newest">Newest first</option><option value="date-oldest">Oldest first</option></select></label><button type="submit">Apply filters</button>{search || field || sort !== "name-asc" ? <Link href="/open-limits">Clear</Link> : null}</form><p>{sortedRows.length} matching {sortedRows.length === 1 ? "Limit" : "Limits"}{search || field ? " - refine the frontier" : ""}</p></section>
    <section className="directory-list" aria-label="Open Limits">{sortedRows.length ? <>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small>{limit.category} &middot; {limit.direction.toLowerCase()} &middot; {limit.publishedAt ? new Date(limit.publishedAt).toLocaleDateString() : "Date unavailable"}</small><b aria-hidden="true">&rarr;</b></Link>)}{pageCount > 1 ? <nav className="directory-pagination" aria-label="Open Limits pages"><Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={pageHref(item)} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link></nav> : null}</> : <div className="directory-empty"><strong>{rows.length ? "No open Limits match these filters." : "No open Limits are published yet."}</strong><p>{rows.length ? "Try a broader search or choose another field." : "Draft records remain private until their Claims, evidence, and independent reviews are accepted."}</p>{rows.length ? <Link href="/open-limits">Clear filters</Link> : <Link href="/about">How publication works &rarr;</Link>}</div>}</section>
    <SiteFooter />
  </main>;
}
