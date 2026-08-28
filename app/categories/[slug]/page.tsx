import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { listPublishedLimits } from "../../../src/db/repository";
import { categoryForSlug } from "../../../src/domain/category";

export const revalidate = 60;
const ALL_PAGE_SIZE = 50;
const SORT_OPTIONS = ["newest", "oldest", "alphabetical", "alphabetical-desc", "status"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; sort?: string }> };

function publishedAtMs(row: Awaited<ReturnType<typeof listPublishedLimits>>[number]) {
  return row.publishedAt ? new Date(row.publishedAt).getTime() : 0;
}

function sortRows<T extends Awaited<ReturnType<typeof listPublishedLimits>>[number]>(rows: T[], sort: SortOption) {
  return rows.toSorted((left, right) => {
    if (sort === "oldest") return publishedAtMs(left) - publishedAtMs(right) || left.title.localeCompare(right.title);
    if (sort === "alphabetical") return left.title.localeCompare(right.title) || left.registryNumber.localeCompare(right.registryNumber);
    if (sort === "alphabetical-desc") return right.title.localeCompare(left.title) || right.registryNumber.localeCompare(left.registryNumber);
    if (sort === "status") return left.status.localeCompare(right.status) || left.title.localeCompare(right.title);
    return publishedAtMs(right) - publishedAtMs(left) || left.registryNumber.localeCompare(right.registryNumber);
  });
}

async function categoryData(slug: string) {
  const rows = await listPublishedLimits().catch(() => []);
  const isAll = slug === "all";
  const category = isAll ? "All limits" : categoryForSlug([...new Set(rows.map((row) => row.category))], slug);
  if (!category) return null;
  const selectedRows = isAll ? rows : rows.filter((row) => row.category === category);
  return { category, isAll, rows: selectedRows };
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
  const sortedRows = sortRows(data.rows, sort);
  const statusCounts = new Map<string, number>();
  for (const row of data.rows) statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const pageCount = data.isAll ? Math.max(1, Math.ceil(data.rows.length / ALL_PAGE_SIZE)) : 1;
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleRows = data.isAll ? sortedRows.slice((page - 1) * ALL_PAGE_SIZE, page * ALL_PAGE_SIZE) : sortedRows;
  const description = data.isAll ? "Every published Limits Registry record, paginated 50 records at a time." : `Every published Limits Registry record classified in ${data.category}.`;
  const pageHref = (targetPage: number) => `/categories/${slug}?page=${targetPage}&sort=${sort}`;
  return <main className="directory-page"><PublicHeader /><section className="directory-intro"><p className="section-kicker">{data.isAll ? "Complete registry" : "Registry field"}</p><h1>{data.category}.</h1><p>{description}</p><div className="directory-stats"><span><strong>{data.rows.length}</strong> published records</span>{[...statusCounts].map(([status,count]) => <span key={status}><strong>{count}</strong> {status.toLowerCase()}</span>)}</div></section><section className="directory-list" aria-label={`${data.category} records`}><form className="directory-sort" method="get"><label htmlFor="category-sort">Sort records</label><select id="category-sort" name="sort" defaultValue={sort}><option value="newest">Date: newest first</option><option value="oldest">Date: oldest first</option><option value="alphabetical">Alphabetical: A–Z</option><option value="alphabetical-desc">Alphabetical: Z–A</option><option value="status">Status</option></select><button type="submit">Apply</button></form>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small><i className={`status ${limit.status.toLowerCase()}`}>{limit.status}</i> · {limit.publishedAt ? new Date(limit.publishedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "Date unavailable"} · {limit.subcategory ?? limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>)}{data.isAll && pageCount > 1 ? <nav className="directory-pagination" aria-label="All registry pages"><Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={pageHref(item)} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link></nav> : null}</section><SiteFooter /></main>;
}
