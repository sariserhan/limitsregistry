import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { getPublicBreakthroughEvent } from "../../../src/db/repository.breakthrough-detail";
import "../breakthroughs.css";

const BASE = "https://www.limitsregistry.com";
const LABEL: Record<string, string> = { STRONGER_BOUND: "BOUND IMPROVED", FRONTIER_CLOSED: "FRONTIER CLOSED" };
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const event = await getPublicBreakthroughEvent((await params).id);
  if (!event) return { title: "Breakthrough not found — Limits Registry" };
  const title = `${LABEL[event.event.eventType] ?? "Breakthrough"}: ${event.limit.title}`;
  return { title: title + " — Limits Registry", description: event.event.eventType === "FRONTIER_CLOSED" ? "A frontier closed for " + event.limit.title + "." : "A stronger bound was accepted for " + event.limit.title + ".", alternates: { canonical: BASE + "/breakthroughs/" + event.event.id }, openGraph: { title, url: BASE + "/breakthroughs/" + event.event.id, type: "article", images: [BASE + "/breakthroughs/" + event.event.id + "/opengraph-image"] } };
}

export default async function BreakthroughPage({ params }: { params: Promise<{ id: string }> }) {
  const event = await getPublicBreakthroughEvent((await params).id);
  if (!event) notFound();
  const previous = event.previousValue === "?" ? "No prior recorded bound" : event.previousValue;
  return <main className="breakthroughs-page"><PublicHeader /><article className="breakthrough-share-page"><Link href="/breakthroughs">← All breakthroughs</Link><p className="section-kicker">Accepted frontier change</p><h1>{LABEL[event.event.eventType] ?? event.event.eventType}</h1><p className="breakthrough-share-id">{event.limit.registryNumber}</p><h2>{event.limit.title}</h2><div className="breakthrough-share-card"><strong>{LABEL[event.event.eventType] ?? "BREAKTHROUGH"}</strong><span>{event.limit.registryNumber}</span><dl><div><dt>Previous</dt><dd>{previous}</dd></div><div><dt>New</dt><dd>{event.newValue}</dd></div><div><dt>Accepted</dt><dd>{new Date(event.event.occurredAt).toISOString().slice(0, 10)}</dd></div></dl><p>{event.event.eventType === "FRONTIER_CLOSED" ? "The accepted evidence closed the frontier under the current specification." : "The accepted evidence tightened the recorded frontier."}</p></div><section className="breakthrough-attribution"><h3>Evidence and attribution</h3><p>{"Accepted Claim changed the published frontier."}</p>{event.people.length ? <p><strong>Researchers:</strong> {event.people.map((person) => person.displayName).join(", ")}</p> : null}{event.papers.length ? <div><strong>Papers</strong>{event.papers.map((paper) => <p key={paper.id}><a href={paper.publisherUrl ?? (paper.doi ? `https://doi.org/${paper.doi}` : paper.arxivId ? `https://arxiv.org/abs/${paper.arxivId}` : "#")} target="_blank" rel="noreferrer">{paper.title} ↗</a></p>)}</div> : null}<p><Link href={`/limits/${event.limit.registryNumber}`}>Read the canonical Limit record →</Link></p></section></article><SiteFooter /></main>;
}
