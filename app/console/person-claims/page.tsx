import { requireRole } from "../../../src/auth/session";
import { listPendingPersonClaimRequests } from "../../../src/db/repository.researchers";
import { decidePersonClaim } from "../../admin/person-claims/actions";

export default async function PersonClaimsPage() {
  await requireRole("EDITOR");
  const requests = await listPendingPersonClaimRequests();
  return <section className="console-section">
    <p className="section-kicker">Editorial queue</p>
    <h1>Researcher attribution requests</h1>
    <p className="lede">Someone is asking to be credited as the verified profile behind a person on the Registry. Check the evidence they provided before approving — this changes what a public page says about a real person.</p>
    {requests.length ? requests.map(({ request, requester, person }) => <article className="admin-panel" key={request.id}>
      <div className="admin-application-head"><div><strong>{requester.name}</strong><small>{requester.email} — claiming: {person.displayName}</small></div><span className="status-badge warn">PENDING</span></div>
      <p><b>Verification note:</b> {request.verificationNote}</p>
      <form className="admin-application-actions" action={decidePersonClaim}>
        <input type="hidden" name="requestId" value={request.id} />
        <input type="hidden" name="personId" value={person.id} />
        <textarea name="reviewNotes" rows={2} placeholder="Decision rationale (optional)" />
        <button name="decision" value="APPROVED">Approve</button>
        <button name="decision" value="REJECTED">Reject</button>
      </form>
    </article>) : <p>No pending attribution requests.</p>}
  </section>;
}
