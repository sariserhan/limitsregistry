import Link from "next/link";
import type { Metadata } from "next";
import { BrandIcon } from "../../src/components/brand-icon";
import { DependencyGraph } from "../../src/components/dependency-graph";
import { listAcceptedDependencies } from "../../src/db/repository.research";
import "./dependencies.css";
export const revalidate = 60;
export const metadata: Metadata = { title: "Dependency Graph — Limits Registry", description: "Reviewed reductions and dependencies between published Limits." };
export default async function DependenciesPage() {
  const edges = await listAcceptedDependencies();
  const nodes = [...new Map(edges.flatMap((edge) => [[edge.source.id, edge.source], [edge.target.id, edge.target]])).values()];
  return <main className="dependencies-page"><header><Link className="brand" href="/"><BrandIcon className="brand-mark"/><span>Limits Registry</span></Link><nav><Link href="/">Browse</Link><Link href="/search">Search</Link></nav></header><section className="dependencies-intro"><p className="section-kicker">Reviewed knowledge graph</p><h1>How Limits depend on one another.</h1><p>Directed links show accepted reductions and dependencies between published Registry records. Draft and rejected submissions are never shown here.</p></section><section className="dependencies-canvas"><div className="dependencies-meta">{nodes.length} Limits · {edges.length} accepted links</div><DependencyGraph nodes={nodes} edges={edges}/></section></main>;
}
