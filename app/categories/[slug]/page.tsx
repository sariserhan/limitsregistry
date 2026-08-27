import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { listPublishedLimits } from "../../../src/db/repository";
import { categoryForSlug } from "../../../src/domain/category";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

async function categoryData(slug: string) {
  const rows = await listPublishedLimits().catch(() => []);
  const category = categoryForSlug([...new Set(rows.map((row) => row.category))], slug);
  if (!category) return null;
  return { category, rows: rows.filter((row) => row.category === category).sort((left, right) => (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0) || left.registryNumber.localeCompare(right.registryNumber)) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await categoryData((await params).slug);
  return data ? { title: `${data.category} Limits — Limits Registry`, description: `All published ${data.category} records in Limits Registry.` } : { title: "Category not found — Limits Registry" };
}

export default async function CategoryPage({ params }: Props) {
  const data = await categoryData((await params).slug);
  if (!data) notFound();
  const statusCounts = new Map<string, number>();
  for (const row of data.rows) statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  return <main className="directory-page"><PublicHeader /><section className="directory-intro"><p className="section-kicker">Registry field</p><h1>{data.category}.</h1><p>Every published Limits Registry record classified in {data.category}, ordered by publication date.</p><div className="directory-stats"><span><strong>{data.rows.length}</strong> published records</span>{[...statusCounts].map(([status,count]) => <span key={status}><strong>{count}</strong> {status.toLowerCase()}</span>)}</div></section><section className="directory-list" aria-label={`${data.category} Limits`}>{data.rows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small><i className={`status ${limit.status.toLowerCase()}`}>{limit.status}</i> · {limit.subcategory ?? limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>)}</section></main>;
}
