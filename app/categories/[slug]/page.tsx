import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { listPublicCategories } from "../../../src/db/repository";
import { listPublicLimitPage, listPublicLimitStatusCounts } from "../../../src/db/repository.public-limits";
import { categoryForSlug } from "../../../src/domain/category";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await categoryData((await params).slug);
  return data ? { title: `${data.category} — Limits Registry`, description: data.isAll ? "All published records in Limits Registry." : `All published ${data.category} records in Limits Registry.` } : { title: "Category not found — Limits Registry" };
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
  const pageHref = (targetPage: number) => `/categories/${slug}?page=${targetPage}&sort=${sort}`;
  return <main className="directory-page"><PublicHeader /><section className="directory-intro"><p className="section-kicker">{data.isAll ? "Complete registry" : "Registry field"}</p><h1>{data.category}.</h1><p>{description}</p><div className="directory-stats"><span><strong>{total}</strong> published records</span>{[...statusCounts].map(([status,count]) => <span key={status}><strong>{count}</strong> {status.toLowerCase()}</span>)}</div></section><section className="directory-list" aria-label={`${data.category} records`}><form className="directory-sort" method="get"><label htmlFor="category-sort">Sort records</label><select id="category-sort" name="sort" defaultValue={sort}><option value="newest">Date: newest first</option><option value="oldest">Date: oldest first</option><option value="alphabetical">Alphabetical: A–Z</option><option value="alphabetical-desc">Alphabetical: Z–A</option><option value="status">Status</option></select><button type="submit">Apply</button></form>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small><i className={`status ${limit.status.toLowerCase()}`}>{limit.status}</i> · {limit.publishedAt ? new Date(limit.publishedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "Date unavailable"} · {limit.subcategory ?? limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>)}{data.isAll && pageCount > 1 ? <nav className="directory-pagination" aria-label="All registry pages"><Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={pageHref(item)} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link></nav> : null}</section><SiteFooter /></main>;
}
