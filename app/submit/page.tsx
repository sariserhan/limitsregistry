import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { listPublishedLimits } from "../../src/db/repository";
import { listSubmissionsByUser } from "../../src/db/repository.submissions";
import { createSubmission } from "./actions";
import "./submit.css";

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  BETTER_ACHIEVABLE_RESULT: "A better achievable result",
  STRONGER_BOUND: "A stronger proven bound",
  PROOF: "A proof",
  REPRODUCTION: "An independent reproduction",
  CORRECTION: "A correction to an existing record",
};

export default async function SubmitPage() {
  const session = await requireRole("USER");
  const [publishedLimits, own] = await Promise.all([listPublishedLimits(), listSubmissionsByUser(session.user.id)]);

  return <main className="submit-page">
    <PublicHeader />
    <div className="submit-content">
    <h1>Submit a proposal</h1>
    <p className="lede">Propose a better result, a stronger bound, a proof, a reproduction, or a correction for a published Limit. Every submission goes through editorial review before anything changes — nothing here publishes automatically.</p>

    <section>
      <h2>New submission</h2>
      <form className="submit-form" action={createSubmission}>
        <div className="submit-row">
          <div className="submit-field">
            <label htmlFor="limitId">Limit</label>
            <select id="limitId" name="limitId" required defaultValue="">
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
          <div className="submit-field"><label htmlFor="proposedRelation">Proposed relation (optional)</label><select id="proposedRelation" name="proposedRelation" defaultValue=""><option value="">—</option><option value="<">&lt;</option><option value="<=">&le;</option><option value="=">=</option><option value=">=">&ge;</option><option value=">">&gt;</option></select></div>
          <div className="submit-field"><label htmlFor="proposedValueExact">Proposed value (optional)</label><input id="proposedValueExact" name="proposedValueExact" placeholder="e.g. 7 or O(n log n)" /></div>
        </div>
        <div className="submit-field"><label htmlFor="evidenceUrl">Evidence URL (optional)</label><input id="evidenceUrl" name="evidenceUrl" type="url" placeholder="Link to a paper, proof, or repository" /></div>
        <button className="submit-submit" type="submit">Submit for review</button>
      </form>
    </section>

    <section>
      <h2>Your submissions ({own.length})</h2>
      {own.map(({ submission, limit }) => <div className="own-submission" key={submission.id}>
        <div>
          <strong>{submission.title}</strong>
          <small>{limit.registryNumber} — {limit.title} · {SUBMISSION_TYPE_LABELS[submission.submissionType]}</small>
          {submission.reviewerNotes && <p style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>Reviewer note: {submission.reviewerNotes}</p>}
        </div>
        <span className={`submission-status ${submission.status.toLowerCase()}`}>{submission.status.replaceAll("_", " ")}</span>
      </div>)}
      {own.length === 0 && <p>You haven&rsquo;t submitted anything yet.</p>}
    </section>
    </div>
    <SiteFooter />
  </main>;
}
