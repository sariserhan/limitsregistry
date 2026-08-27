import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { DependencyGraph } from "../../src/components/dependency-graph";
import { listAcceptedDependencies } from "../../src/db/repository.research";
import "./dependencies.css";
export const revalidate = 60;
export const metadata: Metadata = { title: "Dependency Graph — Limits Registry", description: "Reviewed reductions and dependencies between published Limits." };
export default async function DependenciesPage() {
  const edges = await listAcceptedDependencies();
  const nodes = [...new Map(edges.flatMap((edge) => [[edge.source.id, edge.source], [edge.target.id, edge.target]])).values()];
  return <main className="dependencies-page"><PublicHeader /><section className="dependencies-intro"><p className="section-kicker">Reviewed knowledge graph</p><h1>How Limits depend on one another.</h1><p>Directed links show accepted reductions and dependencies between published Registry records. Draft and rejected submissions are never shown here.</p></section><section className="dependencies-canvas"><div className="dependencies-meta">{nodes.length} Limits · {edges.length} accepted links</div><DependencyGraph nodes={nodes} edges={edges}/>{edges.length === 0 ? <div className="graph-guide"><article><strong>What belongs here?</strong><p>Accepted reductions, prerequisite relationships, and result dependencies between published Limits.</p></article><article><strong>Why is it reviewed?</strong><p>A false dependency can misrepresent an entire field, so draft links stay private until an editor accepts their evidence.</p></article><article><strong>Where are submissions made?</strong><p>Researchers submit candidate links through the Research Console. Public pages show accepted relationships only.</p></article></div> : null}</section></main>;
}
