import { PublicViewCount } from "../../../src/components/public-view-count";
import type { Metadata } from "next";
import Link from "next/link";
import { SponsorCallout } from "../../../src/components/sponsor-callout";
import { SponsorPlacements } from "../../../src/components/sponsor-placements";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { listPublicCategories } from "../../../src/db/repository";
import { listPublicLimitPage, listPublicLimitStatusCounts } from "../../../src/db/repository.public-limits";
import { categoryForSlug } from "../../../src/domain/category";
import { pageMetadata } from "../../../src/domain/seo";

export const revalidate = 60;
const SORT_OPTIONS = ["newest", "oldest", "alphabetical", "alphabetical-desc", "status"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; sort?: string }> };

async function categoryData(slug: string) {
  const categories = await listPublicCategories();
  const isAll = slug === "all";
  const category = isAll ? "All limits" : categoryForSlug(categories, slug);
  return category ? { category, isAll } : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const data = await categoryData(slug);
  if (!data) return { title: "Category not found — Limits Registry" };
  const query = await searchParams;
  const page = Number.parseInt(query.page ?? "1", 10);
  const pageNumber = Number.isFinite(page) && page > 1 ? page : 1;
  const sorted = query.sort !== undefined && query.sort !== "newest";
  const title = `${data.category}${pageNumber > 1 ? ` — page ${pageNumber}` : ""} — Limits Registry`;
  const description = data.isAll ? "All published records in Limits Registry." : `All published ${data.category} records in Limits Registry.`;
  // Each page of the default ordering is its own canonical URL (Google's guidance for paginated
  // lists — canonicalising page 2+ to page 1 would hide the records only listed there). Re-sorted
  // copies of the same records are kept out of the index but still crawled for their links.
  const metadata = pageMetadata({ path: pageNumber > 1 ? `/categories/${slug}?page=${pageNumber}` : `/categories/${slug}`, title, description });
  // No canonical on those: noindex plus a canonical pointing at a different URL is a mixed signal.
  return sorted ? { ...metadata, alternates: undefined, robots: { index: false, follow: true } } : metadata;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = (await params).slug;
  const data = await categoryData(slug);
  if (!data) notFound();
  const query = await searchParams;
  const sort = SORT_OPTIONS.includes(query.sort as SortOption) ? query.sort as SortOption : "newest";
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const sortOption = sort;
  const [pageData, statusCounts] = await Promise.all([
    listPublicLimitPage({ page: Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1, pageSize: 50, category: data.isAll ? undefined : data.category, sort: sortOption }),
    listPublicLimitStatusCounts(data.isAll ? undefined : data.category),
  ]);
  const { rows: visibleRows, total, page, pageCount } = pageData;
  const description = data.isAll ? "Every published Limits Registry record, paginated 50 records at a time." : `Every published Limits Registry record classified in ${data.category}.`;
  // Default ordering gets the clean URL so every record is reachable through one crawlable chain
  // of plain <a href> links (?page=N) rather than a different URL per sort option.
  const pageHref = (targetPage: number) => {
    const search = new URLSearchParams();
    if (targetPage > 1) search.set("page", String(targetPage));
    if (sort !== "newest") search.set("sort", sort);
    const qs = search.toString();
    return `/categories/${slug}${qs ? `?${qs}` : ""}`;
  };
  return <main className="directory-page"><PublicHeader /><section className="directory-intro"><p className="section-kicker">{data.isAll ? "Complete registry" : "Registry field"}</p><h1>{data.category}.</h1><p>{description}</p>{!data.isAll&&<><SponsorCallout category={data.category} context="category"/><SponsorPlacements category={data.category}/></>}<div className="directory-stats">{!data.isAll&&<PublicViewCount kind="CATEGORY" target={data.category}/>}<span><strong>{total}</strong> published records</span>{[...statusCounts].map(([status,count]) => <span key={status}><strong>{count}</strong> {status.toLowerCase()}</span>)}</div></section><section className="directory-list" aria-label={`${data.category} records`}><form className="directory-sort" method="get"><label htmlFor="category-sort">Sort records</label><select id="category-sort" name="sort" defaultValue={sort}><option value="newest">Date: newest first</option><option value="oldest">Date: oldest first</option><option value="alphabetical">Alphabetical: A–Z</option><option value="alphabetical-desc">Alphabetical: Z–A</option><option value="status">Status</option></select><button type="submit">Apply</button></form>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small><i className={`status ${limit.status.toLowerCase()}`}>{limit.status}</i> · {limit.publishedAt ? new Date(limit.publishedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "Date unavailable"} · {limit.subcategory ?? limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>)}{pageCount > 1 ? <nav className="directory-pagination" aria-label={data.isAll ? "All registry pages" : `${data.category} pages`}><Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={pageHref(item)} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link></nav> : null}</section><SiteFooter /></main>;
}
