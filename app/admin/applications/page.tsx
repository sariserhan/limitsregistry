import { listEditorialApplications } from "../../../src/db/repository.applications";
import { decideApplication } from "./actions";

export default async function AdminApplicationsPage() {
  const applications = await listEditorialApplications();
  return <section className="admin-section">
    <h2>Editorial applications</h2>
    <p>Review requests for Reviewer and Editor access. Approving an application changes the applicant account role and records the decision in the audit log.</p>
    {applications.length ? applications.map(({ application, applicant }) => <article className="admin-panel" key={application.id}>
      <div className="admin-application-head"><div><strong>{applicant.name}</strong><small>{applicant.email} - current role: {applicant.role}</small></div><span className={`status-badge ${application.status === "PENDING" ? "warn" : application.status === "APPROVED" ? "ok" : "down"}`}>{application.status}</span></div>
      <p><b>{application.applicationType === "REVIEWER" ? "Reviewer access" : "Editor access"}</b> - {application.affiliation}</p>
      <p><b>Expertise:</b> {application.fieldsOfExpertise.join(", ")}</p>
      <p><b>Credentials:</b> {application.credentials}</p>
      <p><b>Motivation:</b> {application.motivation}</p>
      {application.orcid ? <p><b>ORCID:</b> {application.orcid}</p> : null}
      {application.website ? <p><b>Website:</b> {application.website}</p> : null}
      {application.status === "PENDING" ? <form className="admin-application-actions" action={decideApplication}><input type="hidden" name="applicationId" value={application.id}/><input type="hidden" name="applicationType" value={application.applicationType}/><textarea name="reviewNotes" required minLength={10} rows={2} placeholder="Decision rationale (at least 10 characters)" /><button name="decision" value="APPROVED">Approve</button><button name="decision" value="REJECTED">Reject</button></form> : <small>Reviewed {application.reviewedAt?.toLocaleDateString() ?? "not recorded"} - {application.reviewNotes ?? "No note"}</small>}
    </article>) : <p>No applications yet.</p>}
  </section>;
}
