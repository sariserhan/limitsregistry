import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { LIMIT_COLLECTIONS, countCollectionLimits } from "../../src/db/repository.collections";
import "./collections.css";

export const revalidate = 300;
export const metadata: Metadata = { title: "Scientific Limit Collections — Limits Registry", description: "Explore curated, data-driven collections of published scientific limits." };

export default async function CollectionsPage() {
  const counts = await Promise.all(LIMIT_COLLECTIONS.map(countCollectionLimits));
  return <main className="collections-page"><PublicHeader /><section className="collections-intro"><p className="section-kicker">Explore by question</p><h1>Collections of Limits.</h1><p>Programmatic field guides built from the Registry’s published records. Start with a theme, then follow each record to its evidence, claims, and frontier history.</p></section><section className="collections-grid">{LIMIT_COLLECTIONS.map((collection, index) => <Link className="collection-card" href={`/collections/${collection.slug}`} key={collection.slug}><span className="collection-number">{String(index + 1).padStart(2, "0")}</span><h2>{collection.title}</h2><p>{collection.description}</p><strong>{counts[index]} published Limits <span>→</span></strong></Link>)}</section><SiteFooter /></main>;
}
