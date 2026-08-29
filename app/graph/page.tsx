import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { DependencyGraph } from "../../src/components/dependency-graph";
import { listAcceptedDependencies } from "../../src/db/repository.research";
import { listRecentBreakthroughEvents } from "../../src/db/repository.breakthroughs";
import "../dependencies/dependencies.css";

export const revalidate = 60;
export const metadata: Metadata = { title: "Scientific Knowledge Graph — Limits Registry", description: "Explore connections between Limits, claims, papers, researchers, and breakthroughs." };

export default async function GraphPage() {
  const [edges, breakthroughs] = await Promise.all([listAcceptedDependencies(), listRecentBreakthroughEvents(12)]);
  const nodes = [...new Map(edges.flatMap((edge) => [[edge.source.id, edge.source], [edge.target.id, edge.target]])).values()];
  return <main className="dependencies-page"><PublicHeader /><section className="dependencies-intro"><p className="section-kicker">The Registry graph</p><h1>From papers to breakthroughs.</h1><p>Trace the reviewed chain from research evidence to Claims, researchers, Limits, and the frontier changes that follow. The live visual currently shows accepted Limit dependencies; the surrounding index makes the other relationship layers discoverable.</p></section><section className="graph-explanation" aria-labelledby="graph-layers-title"><p className="section-kicker">Five connected layers</p><h2 id="graph-layers-title">A knowledge graph for scientific frontiers.</h2><div className="graph-explanation-grid"><article><strong>Papers</strong><p>Primary publications and source evidence enter the Registry.</p><Link href="/search?type=paper">Find papers →</Link></article><article><strong>Claims</strong><p>Specific, reviewable assertions connect evidence to a Limit.</p><Link href="/search">Explore Claims →</Link></article><article><strong>Researchers</strong><p>Contributors are attributed to the claims they author, formalize, or reproduce.</p><Link href="/about">How attribution works →</Link></article><article><strong>Limits</strong><p>Canonical questions collect competing bounds under one specification.</p><Link href="/open-limits">Browse Limits →</Link></article><article><strong>Breakthroughs</strong><p>Accepted frontier changes become timestamped, shareable events.</p><Link href="/breakthroughs">See breakthroughs →</Link></article></div></section><section className="dependencies-canvas"><div className="dependencies-meta">{nodes.length} Limits · {edges.length} accepted links · {breakthroughs.length} recent breakthroughs</div><DependencyGraph nodes={nodes} edges={edges}/></section><SiteFooter /></main>;
}
