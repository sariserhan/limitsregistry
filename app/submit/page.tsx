import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { listPublishedLimits } from "../../src/db/repository";
import { listSubmissionsByUser } from "../../src/db/repository.submissions";
import { createSubmission } from "./actions";
import { SubmissionPreviewButton } from "./submission-preview-button";
import "./submit.css";

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  BETTER_ACHIEVABLE_RESULT: "A better achievable result",
  STRONGER_BOUND: "A stronger proven bound",
  PROOF: "A proof",
  REPRODUCTION: "An independent reproduction",
  CORRECTION: "A correction to an existing record",
  SCOPE_CHALLENGE: "Challenge the reference-value scope",
};
const SUBMISSION_STATUS_HELP: Record<string, string> = { SUBMITTED: "Received — waiting to be opened for review.", UNDER_REVIEW: "The scope and evidence are being checked.", ACCEPTED: "Accepted; publication is a separate step.", REJECTED: "Not accepted for the current record. Read the reviewer note for context.", NEEDS_REVISION: "Clarification or stronger evidence was requested." };

type Props = { searchParams: Promise<{ limitId?: string }> };

export default async function SubmitPage({ searchParams }: Props) {
  const session = await requireRole("USER");
  const [publishedLimits, own, params] = await Promise.all([listPublishedLimits(), listSubmissionsByUser(session.user.id), searchParams]);
  const selectedLimitId = params.limitId && publishedLimits.some((limit) => limit.id === params.limitId) ? params.limitId : "";
  const selectedLimit = publishedLimits.find((limit) => limit.id === selectedLimitId);

  return <main className="submit-page">
    <PublicHeader />
    <div className="submit-content">
    <Link className="submit-back" href="/account">Your account &rarr;</Link>
    <h1>Submit a proposal</h1>
    <p className="lede">Think a published record is wrong? Bring evidence. Propose a better result, a stronger bound, a proof, a reproduction, a correction, or challenge whether a reference value&rsquo;s stated scope is right. Nothing changes automatically: the scope and source are checked first.</p>
    {selectedLimit ? <p className="challenge-context"><strong>You are challenging {selectedLimit.registryNumber} — {selectedLimit.title}.</strong> A lower bound raises what is known to be achievable; an upper bound lowers what is still possible.</p> : null}

    <section>
      <h2>New submission</h2>
      <div className="submit-identity"><span>Proposed by</span><strong>{session.user.name}</strong><small>This name comes from your account and is shown to reviewers with your proposal. <a href="/profile">Edit your author profile</a>.</small></div>
      <form className="submit-form" action={createSubmission} encType="multipart/form-data">
        <div className="submit-row">
          <div className="submit-field">
            <label htmlFor="limitId">Limit</label>
            <select id="limitId" name="limitId" required defaultValue={selectedLimitId}>
              <option value="" disabled>Select a Limit</option>
              {publishedLimits.map((l) => <option key={l.id} value={l.id}>{l.registryNumber} — {l.title}</option>)}
            </select>
          </div>
          <div className="submit-field">
            <label htmlFor="submissionType">Type</label>
            <select id="submissionType" name="submissionType" required defaultValue="">
              <option value="" disabled>Select a type</option>
              {Object.entries(SUBMISSION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="submit-field"><label htmlFor="title">Title</label><input id="title" name="title" required minLength={4} placeholder="Short summary of the proposal" /></div>
        <div className="submit-field"><label htmlFor="description">Description</label><textarea id="description" name="description" required minLength={10} rows={5} placeholder="What are you proposing, and why?" /></div>
        <div className="submit-row">
          <div className="submit-field"><label htmlFor="proposedRelation">Proposed bound (not needed for a scope challenge)</label><select id="proposedRelation" name="proposedRelation" defaultValue=""><option value="">Select ≥ or ≤</option><option value="<=">&le; — upper bound</option><option value=">=">&ge; — lower bound</option></select></div>
          <div className="submit-field"><label htmlFor="proposedValueExact">Proposed value (not needed for a scope challenge)</label><input id="proposedValueExact" name="proposedValueExact" placeholder="e.g. 7 or O(n log n)" /></div>
        </div>
        <p className="submit-help">Use ≥ for a stronger achievable result or ≤ for a tighter impossibility result. Include enough detail that someone else can verify the claim. A scope challenge doesn&rsquo;t need a bound — describe what&rsquo;s wrong with the stated scope in the description instead. Provide a stable HTTPS evidence URL or upload a PDF, text, Markdown, or ZIP proof (max 10 MB).</p>
        <div className="submit-field"><label htmlFor="evidenceUrl">Evidence URL or proof upload (one required)</label><input id="evidenceUrl" name="evidenceUrl" type="url" placeholder="https://doi.org/… or proof/repository link" /><input id="proofFile" name="proofFile" type="file" accept=".pdf,.txt,.md,.zip,application/pdf,text/plain,text/markdown,application/zip" /></div>
        <fieldset className="submit-checklist"><legend>Evidence checklist (all required)</legend><label><input name="scopeConfirmed" type="checkbox" required /> My result applies to the exact scope and assumptions of this Limit.</label><label><input name="boundConfirmed" type="checkbox" /> I have stated whether this is a lower bound (≥) or upper bound (≤) — not applicable to a scope challenge.</label><label><input name="evidenceConfirmed" type="checkbox" required /> The attached evidence actually supports the proposal.</label><label><input name="reviewConfirmed" type="checkbox" required /> I understand this will be verified before publication.</label></fieldset>
        <SubmissionPreviewButton />
        <button className="submit-submit" type="submit">Submit for review</button>
      </form>
    </section>

    <section>
      <h2>Your submissions ({own.length})</h2>
      {own.map(({ submission, limit, proof }) => <div className="own-submission" id={`submission-${submission.id}`} key={submission.id}>
        <div>
          <strong>{submission.title}</strong>
          <small>{limit.registryNumber} — {limit.title} · {SUBMISSION_TYPE_LABELS[submission.submissionType]}</small>
          {submission.reviewerNotes && <p style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>Reviewer note: {submission.reviewerNotes}</p>}{proof?.id ? <a href={`/api/submissions/proof/${proof.id}`} target="_blank" rel="noreferrer">Proof file: {proof.filename} ↗</a> : null}
        </div>
        <span className={`submission-status ${submission.status.toLowerCase()}`} title={SUBMISSION_STATUS_HELP[submission.status]}>{submission.status.replaceAll("_", " ")}<small>{SUBMISSION_STATUS_HELP[submission.status]}</small></span>
      </div>)}
      {own.length === 0 && <p>You haven&rsquo;t submitted anything yet.</p>}
    </section>
    </div>
    <SiteFooter />
  </main>;
}
