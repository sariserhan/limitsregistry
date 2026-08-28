import { requireRole } from "../../src/auth/session";
import { hasRole, type Role } from "../../src/auth/permissions";
import { listAllLimits, listCandidateClaims, listPapers, getAcceptedBoundsForLimit } from "../../src/db/repository.console";
import { listSubmissions } from "../../src/db/repository.submissions";
import { searchIndexStatus } from "../../src/db/repository.search";
import { listSourceIngestionJobs } from "../../src/db/repository.ingestion";
import { detectContradiction, type BoundClaim } from "../../src/domain/contradiction";
import type { CandidateClaimExtraction } from "../../src/lib/ai/extract-claims";
import { addSource, decideCandidateClaim, decideSubmission, runExtraction, extractPdfCandidateClaims, importBibtex, reindexSemanticSearch } from "./actions";
import { EditorialWorkspace } from "./editorial-workspace";
import { ConsoleTabs } from "./ConsoleTabs";

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  BETTER_ACHIEVABLE_RESULT: "Better achievable result",
  STRONGER_BOUND: "Stronger proven bound",
  PROOF: "Proof",
  REPRODUCTION: "Independent reproduction",
  CORRECTION: "Correction",
};

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function ConsolePage({ searchParams }: Props) {
  const session = await requireRole("RESEARCHER");
  const canDecide = hasRole(session.user.role as Role, "EDITOR");
  const [papers, limits, candidates, submissions, sourceJobs, indexStatus, params] = await Promise.all([listPapers(), listAllLimits(), listCandidateClaims(), listSubmissions(), listSourceIngestionJobs(), canDecide ? searchIndexStatus() : Promise.resolve([]), searchParams]);
  const pendingSubmissions = submissions.filter((s) => s.submission.status === "SUBMITTED" || s.submission.status === "UNDER_REVIEW");

  const pending = candidates.filter((c) => c.status === "PENDING_REVIEW");
  const boundsByLimit = new Map<string, BoundClaim[]>();
  for (const c of pending) {
    if (c.limitId && !boundsByLimit.has(c.limitId)) boundsByLimit.set(c.limitId, await getAcceptedBoundsForLimit(c.limitId));
  }

  return <>
    <p className="section-kicker">Internal editorial workspace</p>
    <h1>Research Console</h1>
    <p className="lede">Turn papers into reviewable Claims. Everything starts as a private draft; nothing here publishes without editorial review.</p>
    {(params.success || params.error) && <p className={params.error ? "graph-message graph-error" : "graph-message"} role="status">{params.error ?? params.success}</p>}

    <section className="console-guide" aria-labelledby="console-guide-title">
      <div className="console-guide-heading"><p className="section-kicker">Start here</p><h2 id="console-guide-title">The research workflow</h2><p>Use the console in this order. You only need the advanced tools when a paper requires extra evidence or editorial action.</p></div>
      <ol className="console-steps">
        <li><span>01</span><strong>Add a paper</strong><p>Paste a DOI or arXiv link to save citation metadata.</p></li>
        <li><span>02</span><strong>Create draft Claims</strong><p>Extract possible bounds from the paper’s abstract or PDF.</p></li>
        <li><span>03</span><strong>Review the drafts</strong><p>Check the source, scope, units, and contradictions.</p></li>
        <li><span>04</span><strong>Publish</strong><p>Editors accept reviewed Claims into the public Registry.</p></li>
      </ol>
    </section>

    <ConsoleTabs tabs={[
      {
        id: "intake", label: `1 · Sources (${papers.length})`, content: <>
          <section className="intake-primary">
            <div className="section-heading"><div><span className="step-badge">01</span><h2>Add a paper</h2></div><span className="section-status">Private draft</span></div>
            <p className="section-help">Save a paper as a source for your research. We fetch its title, authors, venue, abstract, and citation identifiers. This does not create a public Limit or Claim.</p>
            <form className="intake-form" action={addSource}>
              <label>DOI or arXiv link<input name="source" placeholder="10.1234/example or https://arxiv.org/…" required /></label>
              <button type="submit">Add paper</button>
            </form>
            <details className="help-details"><summary>What can I paste here?</summary><p>Use a DOI such as <code>10.1145/1968.1972</code>, an arXiv ID such as <code>2401.12345</code>, or a full DOI/arXiv URL. The console only records metadata; you can inspect it before extracting anything.</p></details>
          </section>

          <details className="advanced-section">
            <summary>Import several papers from BibTeX</summary>
            <p className="section-help">Optional bulk intake for a bibliography. Imported entries remain draft sources and do not extract Claims automatically.</p>
            <form className="intake-form" action={importBibtex}>
              <textarea name="bibtex" rows={6} placeholder="Paste BibTeX entries here" required />
              <button type="submit">Import papers</button>
            </form>
          </details>

          <section>
            <div className="section-heading"><div><span className="step-badge">02</span><h2>Your papers ({papers.length})</h2></div></div>
            <p className="section-help">Choose a paper below, then create draft Claims from its abstract. Link a Limit only when you already know which Registry problem it belongs to.</p>
            {papers.map((p) => <div className="source-card" key={p.id}>
              <div className="source-card-heading"><strong>{p.title}</strong><small>{p.venue ?? "—"} · {p.doi ?? p.arxivId ?? "no identifier"}</small>{p.abstract ? <span className="source-next-step">Ready for draft Claim extraction</span> : <span className="source-next-step muted">No abstract available — use PDF extraction below</span>}</div>
              {p.abstract && <form className="source-action" action={runExtraction}>
                <label>Optional Registry Limit<select name="limitId" defaultValue=""><option value="">No Limit linked yet</option>{limits.map((l) => <option key={l.id} value={l.id}>{l.registryNumber} — {l.title}</option>)}</select></label>
                <input type="hidden" name="paperId" value={p.id} />
                <input type="hidden" name="title" value={p.title} />
                <input type="hidden" name="abstract" value={p.abstract} />
                <button type="submit">Create draft Claims</button>
              </form>}
              <details className="pdf-details"><summary>{p.abstract ? "Need more evidence? Extract from the PDF" : "Extract Claims from the PDF"}</summary><p>PDF extraction reads the full paper and queues a background job. Use an arXiv paper or an official publisher PDF; the result still needs human review.</p><form className="pdf-job-form" action={extractPdfCandidateClaims}><input type="hidden" name="paperId" value={p.id} /><label>Optional Registry Limit<select name="limitId" defaultValue=""><option value="">No Limit linked yet</option>{limits.map((l) => <option key={l.id} value={l.id}>{l.registryNumber} — {l.title}</option>)}</select></label>{p.arxivId ? <small>Secure arXiv PDF available: {p.arxivId}</small> : <label>Official publisher PDF URL<input name="pdfUrl" type="url" pattern="https://.*" placeholder="https://publisher.org/paper.pdf" required /></label>}<button type="submit">Queue PDF extraction</button></form></details>
            </div>)}
            {papers.length === 0 && <p>No papers yet. Add a DOI or arXiv link above to begin.</p>}
          </section>

          <section>
            <h2>PDF extraction jobs ({sourceJobs.length})</h2>
            {sourceJobs.length ? sourceJobs.map(({ job, paper }) => <article className="source-job" key={job.id}>
              <header><strong>{paper.title}</strong><span className="job-status">{job.status.replaceAll("_", " ")}</span></header>
              <small>{job.sourceType} · Attempt {job.attempts}/{job.maxAttempts}{job.pageCount ? ` · ${job.pageCount} pages` : ""}{job.byteSize ? ` · ${(job.byteSize / 1048576).toFixed(2)} MB` : ""}</small>
              {job.errorMessage ? <p role="alert">{job.errorMessage}</p> : null}
            </article>) : <p>No PDF jobs queued.</p>}
          </section>
        </>,
      },
      {
        id: "queue", label: `2 · Claim review (${pending.length})`, content: <section>
          <div className="section-heading"><div><span className="step-badge">03</span><h2>Review draft Claims ({pending.length})</h2></div></div>
          <p className="section-help">These are machine-generated suggestions, not published facts. Verify each Claim against the paper before an editor promotes it for drafting.</p>
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
        </section>,
      },
      {
        id: "submissions", label: `3 · Public submissions (${pendingSubmissions.length})`, content: <section>
          <div className="section-heading"><div><span className="step-badge">—</span><h2>Public submissions awaiting review ({pendingSubmissions.length})</h2></div></div>
          <p className="section-help">Researchers and visitors can submit proposed improvements from the public site. Review these separately from machine-extracted Claims.</p>
          {pendingSubmissions.map(({ submission, submitter, limit }) => <article className="candidate-card" key={submission.id}>
            <header><span>{submitter.name} ({submitter.email})</span><span>{new Date(submission.createdAt).toLocaleString()}</span></header>
            <div className="candidate-item">
              <strong>{SUBMISSION_TYPE_LABELS[submission.submissionType]} — {submission.title}</strong>
              <div>{limit.registryNumber} — {limit.title}</div>
              <div>{submission.description}</div>
              {submission.proposedRelation && submission.proposedValueExact && <div>Proposed: {submission.proposedRelation} {submission.proposedValueExact}</div>}
              {submission.evidenceUrl && (submission.evidenceUrl.startsWith("http://") || submission.evidenceUrl.startsWith("https://")) && <div><a href={submission.evidenceUrl} target="_blank" rel="noreferrer">Evidence ↗</a></div>}
            </div>
            {canDecide && <form className="candidate-actions" action={decideSubmission} style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
              <input type="hidden" name="id" value={submission.id} />
              <textarea name="notes" placeholder="Reviewer note (required)" rows={2} required style={{ font: "inherit", padding: 8, border: "1px solid var(--line)" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button name="decision" value="ACCEPTED">Accept</button>
                <button name="decision" value="NEEDS_REVISION">Needs revision</button>
                <button name="decision" value="REJECTED">Reject</button>
              </div>
            </form>}
          </article>)}
          {pendingSubmissions.length === 0 && <p>Nothing awaiting review.</p>}
        </section>,
      },
      ...(canDecide ? [{
        id: "editorial", label: "4 · Editorial tools", content: <>
          <section><h2>Semantic search index</h2><p>Refreshes the public index from published Limits, accepted Claims, specifications, and linked papers.</p><p className="index-status" role="status">{indexStatus.length ? indexStatus.map((row) => `${row.status}: ${row.count}`).join(" · ") : "Index is empty — nothing has been embedded yet."}</p><form action={reindexSemanticSearch}><button type="submit">Refresh semantic index</button></form></section>
          <EditorialWorkspace canDecide={canDecide} />
        </>,
      }] : []),
    ]} />
  </>;
}
