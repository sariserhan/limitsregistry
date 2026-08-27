import Link from "next/link";
import { requireRole } from "../../src/auth/session";
import { getReviewerProfile } from "../../src/db/repository.reviewers";
import { saveReviewerProfile } from "./actions";
import "../submit/submit.css";

export default async function ReviewerProfilePage() {
  const session = await requireRole("REVIEWER");
  const profile = await getReviewerProfile(session.user.id);

  return <main className="submit-page">
    <Link href="/console">&larr; Back to Research Console</Link>
    <h1>Reviewer profile</h1>
    <p className="lede">Self-reported expertise and credentials, shown to editors assigning review work. This is not independently verified — treat it as a declaration, not a credential check.</p>

    <section>
      <form className="submit-form" action={saveReviewerProfile}>
        <div className="submit-field">
          <label htmlFor="fieldsOfExpertise">Fields of expertise</label>
          <input id="fieldsOfExpertise" name="fieldsOfExpertise" placeholder="Comma-separated, e.g. graph theory, coding theory" defaultValue={profile?.fieldsOfExpertise.join(", ") ?? ""} />
        </div>
        <div className="submit-field">
          <label htmlFor="credentials">Credentials (self-reported)</label>
          <input id="credentials" name="credentials" placeholder="e.g. PhD Combinatorics, Institution" defaultValue={profile?.credentials ?? ""} />
        </div>
        <div className="submit-field">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={4} defaultValue={profile?.bio ?? ""} />
        </div>
        <button className="submit-submit" type="submit">Save profile</button>
      </form>
    </section>
  </main>;
}
