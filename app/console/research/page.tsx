import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { listAllLimits } from "../../../src/db/repository.console";
import { listBounties, listDependencies } from "../../../src/db/repository.research";
import { submitBounty } from "./actions";
import "../console.css";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function ResearchInfrastructurePage({ searchParams }: Props) {
  await requireRole("RESEARCHER");
  const [dependencies, bounties, limits, params] = await Promise.all([listDependencies(), listBounties(), listAllLimits(), searchParams]);
  return <main className="console-page"><header><Link className="brand" href="/console">← Research Console</Link><nav><Link href="/console/research/graph">Graph</Link> · <Link href="/console/research/artifacts">Artifacts</Link> · <Link href="/breakthroughs">Breakthroughs</Link> · <Link href="/">Public Registry ↗</Link></nav></header><p className="section-kicker">Research infrastructure</p><h1>Evidence graph</h1><p className="lede">Draft-only relationships and external research records. Nothing here changes a Claim’s publication status.</p>
    {(params.success || params.error) && <p className={params.error ? "graph-message graph-error" : "graph-message"} role="status">{params.error ?? params.success}</p>}
    <section><h2>Submit a bounty</h2><p>Informational link only — this does not verify funds, eligibility, or payout.</p><form className="dependency-form" action={submitBounty}><label>Limit (optional)<select name="limitId" defaultValue=""><option value="">Not tied to a specific Limit</option>{limits.map((limit) => <option value={limit.id} key={limit.id}>{limit.registryNumber} — {limit.title}</option>)}</select></label><label>Title<input name="title" required /></label><label>Sponsor<input name="sponsor" required /></label><label>Description<textarea name="description" rows={3} required /></label><label>HTTPS source URL<input name="sourceUrl" type="url" pattern="https://.*" required placeholder="https://…" /></label><label>Amount (optional)<input name="amount" placeholder="1,000,000" /></label><label>Currency (optional)<input name="currency" placeholder="USD" /></label><button type="submit">Submit bounty</button></form></section>
    <section><h2>Dependencies ({dependencies.length})</h2>{dependencies.length ? dependencies.map(item => <article className="candidate-card" key={item.id}><strong>{item.sourceLimitId} → {item.targetLimitId}</strong><div>{item.relation} · {item.reviewStatus}</div></article>) : <p>No dependency links submitted.</p>}<p><Link href="/console/research/graph">Submit or review dependencies ↗</Link></p></section>
    <section><h2>Research bounties ({bounties.length})</h2>{bounties.length ? bounties.map(item => <article className="candidate-card" key={item.id}><strong>{item.title}</strong><div>{item.sponsor} · {item.status}</div><p>{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></article>) : <p>No bounties submitted.</p>}</section>
    <section><h2>Submission API</h2><p>Authenticated editors and researchers can also submit verification artifacts, dependency links, and bounties directly through <code>POST /api/editorial/research</code>.</p></section></main>;
}
