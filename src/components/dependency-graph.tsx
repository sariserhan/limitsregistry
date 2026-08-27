"use client";

import Link from "next/link";
import { useRef, useState, type WheelEvent, type PointerEvent } from "react";
import { dependencyLabel } from "../domain/dependencies";

export type GraphNode = { id: string; registryNumber: string; title: string };
export type GraphEdge = { id: string; sourceLimitId: string; targetLimitId: string; relation: string; reviewStatus?: string };

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

export function DependencyGraph({ nodes, edges, showStatus = false }: { nodes: GraphNode[]; edges: GraphEdge[]; showStatus?: boolean }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragState = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  if (!nodes.length) return <div className="dependency-empty" role="status"><strong>No reviewed dependencies yet.</strong><span>Accepted links will appear here after editorial review.</span></div>;

  const width = 1000, height = Math.max(460, Math.ceil(nodes.length / 6) * 210 + 140), columns = Math.min(6, nodes.length);
  const positions = new Map(nodes.map((node, index) => {
    const row = Math.floor(index / columns), column = index % columns;
    const countInRow = Math.min(columns, nodes.length - row * columns);
    return [node.id, { x: ((column + 1) * width) / (countInRow + 1), y: 105 + row * 210 }] as const;
  }));

  function zoomBy(factor: number) {
    setTransform((t) => ({ ...t, scale: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.scale * factor)) }));
  }
  function onWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1);
  }
  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    (event.target as Element).setPointerCapture(event.pointerId);
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: transform.x, originY: transform.y };
  }
  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setTransform((t) => ({ ...t, x: drag.originX + (event.clientX - drag.startX), y: drag.originY + (event.clientY - drag.startY) }));
  }
  function onPointerUp() { dragState.current = null; }

  return <div className="dependency-visual">
    <div className="dependency-controls" role="group" aria-label="Graph zoom controls">
      <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
      <button type="button" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
      <button type="button" onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} aria-label="Reset view">Reset</button>
    </div>
    <svg role="img" aria-labelledby="dependency-graph-title dependency-graph-desc" viewBox={`0 0 ${width} ${height}`}
      onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      className="dependency-graph-svg" style={{ touchAction: "none" }}>
      <title id="dependency-graph-title">Limit dependency graph</title><desc id="dependency-graph-desc">Directed arrows run from the source Limit to the Limit it reduces to, depends on, improves, or generalizes. Scroll to zoom, drag to pan.</desc>
      <defs><marker id="dependency-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
        {edges.map((edge) => { const source = positions.get(edge.sourceLimitId), target = positions.get(edge.targetLimitId); if (!source || !target) return null; const dx = target.x - source.x, dy = target.y - source.y, distance = Math.hypot(dx, dy) || 1, sx = source.x + dx / distance * 62, sy = source.y + dy / distance * 38, tx = target.x - dx / distance * 68, ty = target.y - dy / distance * 42; return <g className={`dependency-edge status-${edge.reviewStatus?.toLowerCase() ?? "accepted"}`} key={edge.id}><line x1={sx} y1={sy} x2={tx} y2={ty} markerEnd="url(#dependency-arrow)"/><text x={(sx + tx) / 2} y={(sy + ty) / 2 - 8}>{dependencyLabel(edge.relation)}{showStatus && edge.reviewStatus ? ` · ${edge.reviewStatus}` : ""}</text></g>; })}
        {nodes.map((node) => { const point = positions.get(node.id)!; return <g className="dependency-node" key={node.id} transform={`translate(${point.x - 72} ${point.y - 38})`}><rect width="144" height="76" rx="3"/><text className="dependency-node-id" x="12" y="23">{node.registryNumber}</text><foreignObject x="12" y="31" width="120" height="36"><div className="dependency-node-title">{node.title}</div></foreignObject></g>; })}
      </g>
    </svg>
    <ol className="dependency-accessible-list" aria-label="Dependency links">{edges.map((edge) => { const source = nodes.find((node) => node.id === edge.sourceLimitId), target = nodes.find((node) => node.id === edge.targetLimitId); return source && target ? <li key={edge.id}><Link href={`/limits/${source.registryNumber}`}>{source.registryNumber}</Link> {dependencyLabel(edge.relation)} <Link href={`/limits/${target.registryNumber}`}>{target.registryNumber}</Link>{showStatus && edge.reviewStatus ? ` — ${edge.reviewStatus}` : ""}</li> : null; })}</ol>
  </div>;
}
