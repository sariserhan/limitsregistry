import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { listPublishedLimits } from "../../src/db/repository";

export const revalidate = 60;
export const metadata: Metadata = { title: "Open Limits — Limits Registry", description: "Published Limits whose accepted Claims still leave a genuine unknown gap." };

export default async function OpenLimitsPage() {
  let rows: Awaited<ReturnType<typeof listPublishedLimits>> = [];
  try { rows = (await listPublishedLimits()).filter((limit) => limit.status === "OPEN"); } catch { rows = []; }
  const categories = new Set(rows.map((limit) => limit.category)).size;
  return <main className="directory-page">
    <PublicHeader />
    <section className="directory-intro"><p className="section-kicker">Unresolved frontiers</p><h1>Open Limits.</h1><p>Problems where accepted Claims establish part of the frontier, but the current specification still contains a genuine unknown gap.</p><div className="directory-stats"><span><strong>{rows.length}</strong> published open records</span><span><strong>{categories}</strong> fields represented</span></div></section>
    <section className="directory-list" aria-label="Open Limits">{rows.length ? rows.map((limit) => <Link className="directory-row" href={`/limits/${limit.registryNumber}`} key={limit.id}><span>{limit.registryNumber}</span><div><strong>{limit.title}</strong><p>{limit.summary}</p></div><small>{limit.category} · {limit.direction.toLowerCase()}</small><b aria-hidden="true">→</b></Link>) : <div className="directory-empty"><strong>No open Limits are published yet.</strong><p>Draft records remain private until their Claims, evidence, and independent reviews are accepted.</p><Link href="/about">How publication works →</Link></div>}</section>
  </main>;
}
