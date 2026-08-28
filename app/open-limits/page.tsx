import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listPublishedLimits } from "../../src/db/repository";

export const revalidate = 60;
export const metadata: Metadata = { title: "Open Limits — Limits Registry", description: "Published Limits whose accepted Claims still leave a genuine unknown gap." };

const PAGE_SIZE = 50;
type Props = { searchParams: Promise<{ page?: string }> };

export default async function OpenLimitsPage({ searchParams }: Props) {
  let rows: Awaited<ReturnType<typeof listPublishedLimits>> = [];
  try { rows = (await listPublishedLimits()).filter((limit) => limit.status === "OPEN"); } catch { rows = []; }
  const categories = new Set(rows.map((limit) => limit.category)).size;
  const query = await searchParams;
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (targetPage: number) => `/open-limits?page=${targetPage}`;
  return <main className="directory-page">
    <PublicHeader />
    <section className="directory-intro"><p className="section-kicker">Unresolved frontiers</p><h1>Open Limits.</h1><p>Problems where accepted Claims establish part of the frontier, but the current specification still contains a genuine unknown gap.</p><div className="directory-stats"><span><strong>{rows.length}</strong> published open records</span><span><strong>{categories}</strong> fields represented</span></div></section>
    <section className="directory-list" aria-label="Open Limits">{rows.length ? <>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small>{limit.category} · {limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>)}{pageCount > 1 ? <nav className="directory-pagination" aria-label="Open Limits pages"><Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={pageHref(item)} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link></nav> : null}</> : <div className="directory-empty"><strong>No open Limits are published yet.</strong><p>Draft records remain private until their Claims, evidence, and independent reviews are accepted.</p><Link href="/about">How publication works →</Link></div>}</section>
    <SiteFooter />
  </main>;
}
