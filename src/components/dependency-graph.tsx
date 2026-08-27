import Link from "next/link";
import { dependencyLabel } from "../domain/dependencies";

export type GraphNode = { id: string; registryNumber: string; title: string };
export type GraphEdge = { id: string; sourceLimitId: string; targetLimitId: string; relation: string; reviewStatus?: string };

export function DependencyGraph({ nodes, edges, showStatus = false }: { nodes: GraphNode[]; edges: GraphEdge[]; showStatus?: boolean }) {
  if (!nodes.length) return <div className="dependency-empty" role="status"><strong>No reviewed dependencies yet.</strong><span>Accepted links will appear here after editorial review.</span></div>;
  const width = 1000, height = Math.max(460, Math.ceil(nodes.length / 6) * 210 + 140), columns = Math.min(6, nodes.length);
  const positions = new Map(nodes.map((node, index) => {
    const row = Math.floor(index / columns), column = index % columns;
    const countInRow = Math.min(columns, nodes.length - row * columns);
    return [node.id, { x: ((column + 1) * width) / (countInRow + 1), y: 105 + row * 210 }] as const;
  }));
  return <div className="dependency-visual">
    <svg role="img" aria-labelledby="dependency-graph-title dependency-graph-desc" viewBox={`0 0 ${width} ${height}`}>
      <title id="dependency-graph-title">Limit dependency graph</title><desc id="dependency-graph-desc">Directed arrows run from the source Limit to the Limit it reduces to, depends on, improves, or generalizes.</desc>
      <defs><marker id="dependency-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      {edges.map((edge) => { const source = positions.get(edge.sourceLimitId), target = positions.get(edge.targetLimitId); if (!source || !target) return null; const dx = target.x - source.x, dy = target.y - source.y, distance = Math.hypot(dx, dy) || 1, sx = source.x + dx / distance * 62, sy = source.y + dy / distance * 38, tx = target.x - dx / distance * 68, ty = target.y - dy / distance * 42; return <g className={`dependency-edge status-${edge.reviewStatus?.toLowerCase() ?? "accepted"}`} key={edge.id}><line x1={sx} y1={sy} x2={tx} y2={ty} markerEnd="url(#dependency-arrow)"/><text x={(sx + tx) / 2} y={(sy + ty) / 2 - 8}>{dependencyLabel(edge.relation)}{showStatus && edge.reviewStatus ? ` · ${edge.reviewStatus}` : ""}</text></g>; })}
      {nodes.map((node) => { const point = positions.get(node.id)!; return <g className="dependency-node" key={node.id} transform={`translate(${point.x - 72} ${point.y - 38})`}><rect width="144" height="76" rx="3"/><text className="dependency-node-id" x="12" y="23">{node.registryNumber}</text><foreignObject x="12" y="31" width="120" height="36"><div className="dependency-node-title">{node.title}</div></foreignObject></g>; })}
    </svg>
    <ol className="dependency-accessible-list" aria-label="Dependency links">{edges.map((edge) => { const source = nodes.find((node) => node.id === edge.sourceLimitId), target = nodes.find((node) => node.id === edge.targetLimitId); return source && target ? <li key={edge.id}><Link href={`/limits/${source.registryNumber}`}>{source.registryNumber}</Link> {dependencyLabel(edge.relation)} <Link href={`/limits/${target.registryNumber}`}>{target.registryNumber}</Link>{showStatus && edge.reviewStatus ? ` — ${edge.reviewStatus}` : ""}</li> : null; })}</ol>
  </div>;
}
