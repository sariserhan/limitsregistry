import { requireRole } from "../../../src/auth/session";
import { listEditorialApplications } from "../../../src/db/repository.applications";
import { decideApplication } from "../../admin/applications/actions";

export default async function EditorialApplicationsPage() {
  await requireRole("EDITOR");
  const applications = await listEditorialApplications("REVIEWER");
  return <section className="console-section">
    <p className="section-kicker">Editorial queue</p>
    <h1>Reviewer applications</h1>
    <p className="lede">Reviewers are entrusted with evidence decisions, not with changing the public record. Every decision is attributed and audited.</p>
    {applications.length ? applications.map(({ application, applicant }) => <article className="admin-panel" key={application.id}>
      <div className="admin-application-head"><div><strong>{applicant.name}</strong><small>{applicant.email} - current role: {applicant.role}</small></div><span className={`status-badge ${application.status === "PENDING" ? "warn" : application.status === "APPROVED" ? "ok" : "down"}`}>{application.status}</span></div>
      <p><b>Affiliation:</b> {application.affiliation}</p><p><b>Expertise:</b> {application.fieldsOfExpertise.join(", ")}</p><p><b>Credentials:</b> {application.credentials}</p><p><b>Motivation:</b> {application.motivation}</p>
      {application.status === "PENDING" ? <form className="admin-application-actions" action={decideApplication}><input type="hidden" name="applicationId" value={application.id}/><input type="hidden" name="applicationType" value={application.applicationType}/><textarea name="reviewNotes" required minLength={10} rows={2} placeholder="Decision rationale (at least 10 characters)" /><button name="decision" value="APPROVED">Approve</button><button name="decision" value="REJECTED">Reject</button></form> : <small>Reviewed {application.reviewedAt?.toLocaleDateString() ?? "not recorded"} - {application.reviewNotes ?? "No note"}</small>}
    </article>) : <p>No reviewer applications yet.</p>}
  </section>;
}
