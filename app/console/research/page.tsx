import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { listBounties, listDependencies } from "../../../src/db/repository.research";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function ResearchInfrastructurePage({ searchParams }: Props) {
  await requireRole("RESEARCHER");
  const [dependencies, bounties, params] = await Promise.all([listDependencies(), listBounties(), searchParams]);
  return <><p className="section-kicker">Research infrastructure</p><h1>Evidence graph</h1><p className="lede">Draft-only relationships and external research records. Nothing here changes a Claim’s publication status.</p>
    {(params.success || params.error) && <p className={params.error ? "graph-message graph-error" : "graph-message"} role="status">{params.error ?? params.success}</p>}
    <section><h2>Dependencies ({dependencies.length})</h2>{dependencies.length ? dependencies.map(item => <article className="candidate-card" key={item.id}><strong>{item.source.registryNumber} → {item.target.registryNumber}</strong><div>{item.relation} · {item.reviewStatus}</div></article>) : <p>No dependency links submitted.</p>}<p><Link href="/console/research/graph">Submit or review dependencies ↗</Link></p></section>
    <section><h2>Research bounties ({bounties.length}) · <Link href="/console/research/bounties">Open moderation queue ↗</Link></h2>{bounties.length ? bounties.map(item => <article className="candidate-card" key={item.id}><strong>{item.title}</strong><div>{item.sponsor} · {item.status}</div><p>{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></article>) : <p>No bounties submitted.</p>}</section>
    <section><h2>Submission API</h2><p>Authenticated editors and researchers can also submit verification artifacts, dependency links, and bounties directly through <code>POST /api/editorial/research</code>.</p></section></>;
}
