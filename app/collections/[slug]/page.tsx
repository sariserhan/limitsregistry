import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { Breadcrumbs } from "../../../src/components/breadcrumbs";
import { getLimitCollection, listCollectionLimits } from "../../../src/db/repository.collections";
import "../collections.css";

const BASE = "https://www.limitsregistry.com";
export const revalidate = 300;

export async function generateStaticParams() { return (await import("../../../src/db/repository.collections")).LIMIT_COLLECTIONS.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const collection = getLimitCollection((await params).slug);
  if (!collection) return { title: "Collection not found — Limits Registry" };
  return { title: `${collection.title} — Limits Registry`, description: collection.description, alternates: { canonical: `${BASE}/collections/${collection.slug}` }, openGraph: { title: collection.title, description: collection.description, url: `${BASE}/collections/${collection.slug}`, type: "website" } };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const collection = getLimitCollection((await params).slug);
  if (!collection) notFound();
  const rows = await listCollectionLimits(collection);
  return <main className="collections-page"><PublicHeader /><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections" }, { label: collection.title }]} /><section className="collection-detail-intro"><Link href="/collections">← All collections</Link><p className="section-kicker">Registry collection</p><h1>{collection.title}</h1><p>{collection.description}</p><span>{rows.length}{rows.length === 100 ? "+" : ""} published records in this collection</span></section><section className="collection-records" aria-label={`${collection.title} records`}>{rows.map((record) => <article className="collection-record" key={record.id}><div><span className="collection-record-id">{record.registryNumber} · {record.category}</span><h2><Link href={`/limits/${record.registryNumber}`}>{record.title}</Link></h2><p>{record.summary}</p></div><span className={`public-status ${record.status.toLowerCase()}`}>{record.status}</span></article>)}</section><SiteFooter /></main>;
}
