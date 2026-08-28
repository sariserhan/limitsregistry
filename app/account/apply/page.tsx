import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { listApplicationsByUser } from "../../../src/db/repository.applications";
import { hasRole, type Role } from "../../../src/auth/permissions";
import { submitEditorialApplication } from "./actions";
import "../../submit/submit.css";
import "../../admin/admin.css";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function EditorialAccessPage({ searchParams }: Props) {
  const session = await requireRole("USER");
  const params = await searchParams;
  const role = session.user.role as Role;
  const applications = await listApplicationsByUser(session.user.id);
  const canApplyReviewer = !hasRole(role, "REVIEWER");
  const canApplyEditor = !hasRole(role, "EDITOR");
  return <main className="submit-page">
    <div className="submit-content">
      <p><Link href="/account">Back to your account</Link></p>
      <h1>Editorial access</h1>
      <p className="lede">Apply to help evaluate evidence in the Registry. Applications are reviewed by the editorial team; approval changes your account role only after a recorded decision.</p>
      {(params.success || params.error) ? <p className={params.error ? "form-error" : "form-success"} role="status">{params.error ?? params.success}</p> : null}
      <section>
        <h2>Your applications</h2>
        {applications.length ? applications.map((application) => <div className="own-submission" key={application.id}><div><strong>{application.applicationType === "REVIEWER" ? "Reviewer access" : "Editor access"}</strong><small>{application.createdAt.toLocaleDateString()} - {application.reviewNotes ?? "Awaiting decision"}</small></div><span className={`submission-status ${application.status.toLowerCase()}`}>{application.status.replaceAll("_", " ")}</span></div>) : <p>No applications submitted yet.</p>}
      </section>
      {(canApplyReviewer || canApplyEditor) ? <section>
        <h2>Start an application</h2>
        <p>Reviewer access is for independent evidence review. Editor access includes editorial decisions and is held to a higher bar.</p>
        <form className="submit-form" action={submitEditorialApplication}>
          <div className="submit-field"><label>Access requested</label><select name="applicationType" required defaultValue="REVIEWER"><option value="REVIEWER" disabled={!canApplyReviewer}>Reviewer access</option><option value="EDITOR" disabled={!canApplyEditor}>Editor access</option></select></div>
          <div className="submit-field"><label>Affiliation</label><input name="affiliation" required placeholder="University, company, institute, or independent researcher" /></div>
          <div className="submit-field"><label>ORCID (optional)</label><input name="orcid" placeholder="https://orcid.org/..." /></div>
          <div className="submit-field"><label>Website or profile (optional)</label><input name="website" type="url" placeholder="https://..." /></div>
          <div className="submit-field"><label>Fields of expertise</label><input name="fieldsOfExpertise" required placeholder="e.g. combinatorics, complexity theory, physics" /><small>Separate multiple fields with commas.</small></div>
          <div className="submit-field"><label>Credentials and relevant work</label><textarea name="credentials" required minLength={30} rows={5} placeholder="Publications, reviewing experience, formal training, or other relevant work." /></div>
          <div className="submit-field"><label>Why do you want to contribute?</label><textarea name="motivation" required minLength={30} rows={5} placeholder="Describe the records or evidence you can evaluate carefully." /></div>
          <label className="submit-check"><input name="conflictDisclosure" type="checkbox" required />I will disclose conflicts of interest for individual reviews and follow the <Link href="/editorial-policy">editorial policy</Link>.</label>
          <button className="submit-submit" type="submit">Submit application</button>
        </form>
      </section> : <p>You already hold the highest available access for this workflow.</p>}
    </div>
  </main>;
}
