import Link from "next/link";
import { requireRole } from "../../src/auth/session";
import { hasRole, type Role } from "../../src/auth/permissions";
import { listAllLimits, listCandidateClaims, listPapers, getAcceptedBoundsForLimit } from "../../src/db/repository.console";
import { listSubmissions } from "../../src/db/repository.submissions";
import { detectContradiction, type BoundClaim } from "../../src/domain/contradiction";
import type { CandidateClaimExtraction } from "../../src/lib/ai/extract-claims";
import { addSource, decideCandidateClaim, decideSubmission, runExtraction } from "./actions";
import { EditorialWorkspace } from "./editorial-workspace";
import "./console.css";

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  BETTER_ACHIEVABLE_RESULT: "Better achievable result",
  STRONGER_BOUND: "Stronger proven bound",
  PROOF: "Proof",
  REPRODUCTION: "Independent reproduction",
  CORRECTION: "Correction",
};

export default async function ConsolePage() {
  const session = await requireRole("RESEARCHER");
  const [papers, limits, candidates, submissions] = await Promise.all([listPapers(), listAllLimits(), listCandidateClaims(), listSubmissions()]);
  const canDecide = hasRole(session.user.role as Role, "EDITOR");
  const pendingSubmissions = submissions.filter((s) => s.submission.status === "SUBMITTED" || s.submission.status === "UNDER_REVIEW");

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

    <section>
      <h2>Public submissions awaiting review ({pendingSubmissions.length})</h2>
      {pendingSubmissions.map(({ submission, submitter, limit }) => <article className="candidate-card" key={submission.id}>
        <header><span>{submitter.name} ({submitter.email})</span><span>{new Date(submission.createdAt).toLocaleString()}</span></header>
        <div className="candidate-item">
          <strong>{SUBMISSION_TYPE_LABELS[submission.submissionType]} — {submission.title}</strong>
          <div>{limit.registryNumber} — {limit.title}</div>
          <div>{submission.description}</div>
          {submission.proposedRelation && submission.proposedValueExact && <div>Proposed: {submission.proposedRelation} {submission.proposedValueExact}</div>}
          {submission.evidenceUrl && <div><a href={submission.evidenceUrl} target="_blank" rel="noreferrer">Evidence ↗</a></div>}
        </div>
        {canDecide && <form className="candidate-actions" action={decideSubmission} style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
          <input type="hidden" name="id" value={submission.id} />
          <textarea name="notes" placeholder="Reviewer note (required)" rows={2} style={{ font: "inherit", padding: 8, border: "1px solid var(--line)" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button name="decision" value="ACCEPTED">Accept</button>
            <button name="decision" value="NEEDS_REVISION">Needs revision</button>
            <button name="decision" value="REJECTED">Reject</button>
          </div>
        </form>}
      </article>)}
      {pendingSubmissions.length === 0 && <p>Nothing awaiting review.</p>}
    </section>

    <EditorialWorkspace />
  </main>;
}
