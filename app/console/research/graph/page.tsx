import { requireRole } from "../../../../src/auth/session";
import { hasRole, type Role } from "../../../../src/auth/permissions";
import { listAllLimits } from "../../../../src/db/repository.console";
import { listDependencies } from "../../../../src/db/repository.research";
import { DEPENDENCY_RELATIONS, dependencyLabel } from "../../../../src/domain/dependencies";
import { DependencyGraph } from "../../../../src/components/dependency-graph";
import { reviewDependency, submitDependency } from "./actions";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };
export default async function GraphPage({ searchParams }: Props) {
  const session = await requireRole("RESEARCHER");
  const [edges, limits, params] = await Promise.all([listDependencies(), listAllLimits(), searchParams]);
  const canDecide = hasRole(session.user.role as Role, "EDITOR");
  const nodes = [...new Map(edges.flatMap((edge) => [[edge.source.id, edge.source], [edge.target.id, edge.target]])).values()];
  return <>
    <p className="section-kicker">Knowledge graph</p><h1>Limit dependencies</h1><p className="lede">An arrow reads source → target. For example, “A reduces to B” means solving B can solve A. Every new edge is private until an editor accepts it. <a className="console-exit" href="/dependencies">Public graph ↗</a></p>
    {(params.success || params.error) && <p className={params.error ? "graph-message graph-error" : "graph-message"} role="status">{params.error ?? params.success}</p>}
    <section><h2>Submit a dependency</h2><form className="dependency-form" action={submitDependency}><label>Source Limit<select name="sourceLimitId" required defaultValue=""><option value="" disabled>Choose source</option>{limits.map((limit) => <option value={limit.id} key={limit.id}>{limit.registryNumber} — {limit.title}</option>)}</select></label><label>Relation<select name="relation" required>{DEPENDENCY_RELATIONS.map((relation) => <option value={relation} key={relation}>{dependencyLabel(relation)}</option>)}</select></label><label>Target Limit<select name="targetLimitId" required defaultValue=""><option value="" disabled>Choose target</option>{limits.map((limit) => <option value={limit.id} key={limit.id}>{limit.registryNumber} — {limit.title}</option>)}</select></label><label>Evidence Claim (optional)<input name="evidenceClaimId" placeholder="Claim UUID" /></label><button type="submit">Submit for review</button></form></section>
    <section><h2>Graph ({nodes.length} records · {edges.length} links)</h2><DependencyGraph nodes={nodes} edges={edges} showStatus /></section>
    <section><h2>Editorial queue</h2>{edges.length ? edges.map((edge) => <article className="candidate-card" key={edge.id}><strong>{edge.source.registryNumber} {dependencyLabel(edge.relation)} {edge.target.registryNumber}</strong><div>{edge.source.title} → {edge.target.title}</div><small>{edge.reviewStatus}{edge.evidenceClaimId ? ` · Evidence Claim ${edge.evidenceClaimId}` : ""}</small>{canDecide && edge.reviewStatus === "DRAFT" ? <form className="candidate-actions" action={reviewDependency}><input type="hidden" name="id" value={edge.id}/><button name="decision" value="ACCEPTED">Accept</button><button name="decision" value="REJECTED">Reject</button></form> : null}</article>) : <p>No dependency links submitted yet.</p>}</section>
  </>;
}
