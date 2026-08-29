import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "../../../../src/auth/session";
import { getPerson } from "../../../../src/db/repository.entities";
import { getPendingPersonClaimRequest } from "../../../../src/db/repository.researchers";
import { submitResearcherClaim } from "./actions";
import "../../../submit/submit.css";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ClaimResearcherPage({ params, searchParams }: Props) {
  const session = await requireRole("USER");
  const { id } = await params;
  const [person, query, pending] = await Promise.all([getPerson(id), searchParams, getPendingPersonClaimRequest(id, session.user.id)]);
  if (!person) notFound();
  return <main className="submit-page">
    <div className="submit-content">
      <p><Link href={`/researchers/${person.id}`}>Back to {person.displayName}</Link></p>
      <h1>Is this you?</h1>
      <p className="lede">Request attribution over {person.displayName}&rsquo;s profile. An editor reviews every request before it takes effect — this isn&rsquo;t automatic.</p>
      {(query.success || query.error) ? <p className={query.error ? "form-error" : "form-success"} role="status">{query.error ?? query.success}</p> : null}
      {person.profileStatus === "CLAIMED" ? <p>This profile is already verified.</p>
        : pending ? <p>You already have a pending request for this profile, submitted {pending.createdAt.toLocaleDateString()}. An editor will review it.</p>
        : <form className="submit-form" action={submitResearcherClaim}>
          <input type="hidden" name="personId" value={person.id} />
          <div className="submit-field"><label>How can we verify this is you?</label><textarea name="verificationNote" required minLength={20} rows={5} placeholder="An ORCID profile, an institutional email or homepage listing this work, a link to the paper with your name on it — anything that lets an editor check." /></div>
          <button className="submit-submit" type="submit">Submit claim request</button>
        </form>}
    </div>
  </main>;
}
