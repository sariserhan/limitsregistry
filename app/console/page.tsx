import Link from "next/link";
import { requireRole } from "../../src/auth/session";
import { hasRole, type Role } from "../../src/auth/permissions";
import { listAllLimits, listCandidateClaims, listPapers, getAcceptedBoundsForLimit } from "../../src/db/repository.console";
import { detectContradiction, type BoundClaim } from "../../src/domain/contradiction";
import type { CandidateClaimExtraction } from "../../src/lib/ai/extract-claims";
import { addSource, decideCandidateClaim, runExtraction } from "./actions";
import { EditorialWorkspace } from "./editorial-workspace";
import "./console.css";

export default async function ConsolePage() {
  const session = await requireRole("RESEARCHER");
  const [papers, limits, candidates] = await Promise.all([listPapers(), listAllLimits(), listCandidateClaims()]);
  const canDecide = hasRole(session.user.role as Role, "EDITOR");

  const pending = candidates.filter((c) => c.status === "PENDING_REVIEW");
  const boundsByLimit = new Map<string, BoundClaim[]>();
  for (const c of pending) {
    if (c.limitId && !boundsByLimit.has(c.limitId)) boundsByLimit.set(c.limitId, await getAcceptedBoundsForLimit(c.limitId));
  }

  return <main className="console-page">
    <header><Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></Link><Link href="/">Public Registry ↗</Link></header>
    <p className="section-kicker">Internal editorial workspace</p>
    <h1>Research Console</h1>
    <p className="lede">Signed in as {session.user.email} · {session.user.role}. Sources, AI extraction, and record drafting are draft-only — nothing here publishes without editorial review.</p>

    <section>
      <h2>Add a source</h2>
      <form className="intake-form" action={addSource}>
        <input name="source" placeholder="DOI (10.xxxx/…) or arXiv ID/URL" required />
        <button type="submit">Fetch metadata</button>
      </form>
    </section>

    <section>
      <h2>Sources ({papers.length})</h2>
      {papers.map((p) => <div className="source-card" key={p.id}>
        <div><strong>{p.title}</strong><small>{p.venue ?? "—"} · {p.doi ?? p.arxivId ?? "no identifier"}</small></div>
        {p.abstract && <form action={runExtraction}>
          <input type="hidden" name="paperId" value={p.id} />
          <input type="hidden" name="title" value={p.title} />
          <input type="hidden" name="abstract" value={p.abstract} />
          <select name="limitId" defaultValue="">
            <option value="">No Limit linked</option>
            {limits.map((l) => <option key={l.id} value={l.id}>{l.registryNumber} — {l.title}</option>)}
          </select>
          <button type="submit">Extract candidate claims</button>
        </form>}
      </div>)}
      {papers.length === 0 && <p>No sources yet.</p>}
    </section>

    <section>
      <h2>Candidate claims awaiting review ({pending.length})</h2>
      {pending.map((c) => {
        const extraction = c.extraction as unknown as CandidateClaimExtraction;
        const bounds = c.limitId ? boundsByLimit.get(c.limitId) ?? [] : [];
        return <article className="candidate-card" key={c.id}>
          <header><span>{c.model} · {c.promptVersion}</span><span>{new Date(c.createdAt).toLocaleString()}</span></header>
          {extraction.claims.map((claim, i) => {
            const numeric = Number.parseFloat(claim.valueText);
            const warning = c.limitId && Number.isFinite(numeric) ? detectContradiction(bounds, { relation: claim.relation, valueNumeric: numeric }) : null;
            return <div className="candidate-item" key={i}>
              <strong>{claim.relation} {claim.valueText}{claim.unit ? ` ${claim.unit}` : ""}</strong> — {claim.claimType.replaceAll("_", " ")} ({Math.round(claim.confidence * 100)}% confidence)
              <div>{claim.quantityDescription}</div>
              {warning && <div className="warn">⚠ {warning}</div>}
            </div>;
          })}
          {canDecide && <form className="candidate-actions" action={decideCandidateClaim}>
            <input type="hidden" name="id" value={c.id} />
            <button name="decision" value="PROMOTED">Promote for claim drafting</button>
            <button name="decision" value="DISMISSED">Dismiss</button>
          </form>}
        </article>;
      })}
      {pending.length === 0 && <p>Nothing awaiting review.</p>}
    </section>

    <EditorialWorkspace />
  </main>;
}
