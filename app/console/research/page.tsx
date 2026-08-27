import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { listBounties, listDependencies } from "../../../src/db/repository.research";
import "../console.css";
export default async function ResearchInfrastructurePage() {
  await requireRole("RESEARCHER");
  const [dependencies, bounties] = await Promise.all([listDependencies(), listBounties()]);
  return <main className="console-page"><header><Link className="brand" href="/console">← Research Console</Link><Link href="/">Public Registry ↗</Link></header><p className="section-kicker">Research infrastructure</p><h1>Evidence graph</h1><p className="lede">Draft-only relationships and external research records. Nothing here changes a Claim’s publication status.</p><section><h2>Dependencies ({dependencies.length})</h2>{dependencies.length ? dependencies.map(item => <article className="candidate-card" key={item.id}><strong>{item.sourceLimitId} → {item.targetLimitId}</strong><div>{item.relation} · {item.reviewStatus}</div></article>) : <p>No dependency links submitted.</p>}</section><section><h2>Research bounties ({bounties.length}) · <Link href="/console/research/bounties">Open moderation queue ↗</Link></h2>{bounties.length ? bounties.map(item => <article className="candidate-card" key={item.id}><strong>{item.title}</strong><div>{item.sponsor} · {item.status}</div><p>{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></article>) : <p>No bounties submitted.</p>}</section><section><h2>Submission API</h2><p>Authenticated editors and researchers can submit verification artifacts, dependency links, and bounties through <code>POST /api/editorial/research</code>.</p></section></main>;
}
