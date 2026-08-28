import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { listPublishedLimits } from "../../../src/db/repository";
import { categoryForSlug } from "../../../src/domain/category";

export const revalidate = 60;
const ALL_PAGE_SIZE = 50;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

async function categoryData(slug: string) {
  const rows = await listPublishedLimits().catch(() => []);
  const isAll = slug === "all";
  const category = isAll ? "All limits" : categoryForSlug([...new Set(rows.map((row) => row.category))], slug);
  if (!category) return null;
  // listPublishedLimits() is unstable_cache-wrapped, which JSON-round-trips the result — publishedAt
  // comes back as a string at runtime despite its Date type, so it needs re-coercing before .getTime().
  const publishedAtMs = (row: (typeof rows)[number]) => row.publishedAt ? new Date(row.publishedAt).getTime() : 0;
  const selectedRows = isAll ? rows : rows.filter((row) => row.category === category);
  return { category, isAll, rows: selectedRows.sort((left, right) => publishedAtMs(right) - publishedAtMs(left) || left.registryNumber.localeCompare(right.registryNumber)) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await categoryData((await params).slug);
  return data ? { title: `${data.category} — Limits Registry`, description: data.isAll ? "All published records in Limits Registry." : `All published ${data.category} records in Limits Registry.` } : { title: "Category not found — Limits Registry" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const data = await categoryData((await params).slug);
  if (!data) notFound();
  const statusCounts = new Map<string, number>();
  for (const row of data.rows) statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  const requestedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  const pageCount = data.isAll ? Math.max(1, Math.ceil(data.rows.length / ALL_PAGE_SIZE)) : 1;
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleRows = data.isAll ? data.rows.slice((page - 1) * ALL_PAGE_SIZE, page * ALL_PAGE_SIZE) : data.rows;
  const description = data.isAll ? "Every published Limits Registry record, ordered by publication date and paginated 50 records at a time." : `Every published Limits Registry record classified in ${data.category}, ordered by publication date.`;
  return <main className="directory-page"><PublicHeader /><section className="directory-intro"><p className="section-kicker">{data.isAll ? "Complete registry" : "Registry field"}</p><h1>{data.category}.</h1><p>{description}</p><div className="directory-stats"><span><strong>{data.rows.length}</strong> published records</span>{[...statusCounts].map(([status,count]) => <span key={status}><strong>{count}</strong> {status.toLowerCase()}</span>)}</div></section><section className="directory-list" aria-label={`${data.category} records`}>{visibleRows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small><i className={`status ${limit.status.toLowerCase()}`}>{limit.status}</i> · {limit.subcategory ?? limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>)}{data.isAll && pageCount > 1 ? <nav className="directory-pagination" aria-label="All registry pages"><Link aria-disabled={page === 1} href={`/categories/all?page=${Math.max(1, page - 1)}`}>Previous</Link><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <Link className={item === page ? "active" : ""} aria-current={item === page ? "page" : undefined} href={`/categories/all?page=${item}`} key={item}>{item}</Link>)}</div><Link aria-disabled={page === pageCount} href={`/categories/all?page=${Math.min(pageCount, page + 1)}`}>Next</Link></nav> : null}</section></main>;
}
