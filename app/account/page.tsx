import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { hasRole, type Role } from "../../src/auth/permissions";
import { listSubmissionsByUser } from "../../src/db/repository.submissions";
import { listReviewsByUser } from "../../src/db/repository";
import { listBountiesByUser } from "../../src/db/repository.research";
import "../submit/submit.css";

export default async function AccountPage() {
  const session = await requireRole("USER");
  const role = session.user.role as Role;
  const isReviewer = hasRole(role, "REVIEWER");
  const isResearcher = hasRole(role, "RESEARCHER");

  const [submissions, reviews, bounties] = await Promise.all([
    listSubmissionsByUser(session.user.id),
    isReviewer ? listReviewsByUser(session.user.id) : Promise.resolve([]),
    isResearcher ? listBountiesByUser(session.user.id) : Promise.resolve([]),
  ]);

  return <main className="submit-page">
    <PublicHeader />
    <div className="submit-content">
      <h1>Your account</h1>
      <p className="lede">{session.user.email} · {role}</p>

      <section>
        <h2>Quick links</h2>
        <p>
          <Link href="/submit">Submit a proposal</Link> · <Link href="/watchlists">Watchlists</Link>
          {isReviewer ? <> · <Link href="/reviewer-profile">Reviewer profile</Link></> : null}
          {isResearcher ? <> · <Link href="/console">Research Console</Link></> : null}
        </p>
      </section>

      <section>
        <h2>Your submissions ({submissions.length})</h2>
        {submissions.map(({ submission, limit }) => <div className="own-submission" key={submission.id}>
          <div>
            <strong>{submission.title}</strong>
            <small>{limit.registryNumber} — {limit.title}</small>
          </div>
          <span className={`submission-status ${submission.status.toLowerCase()}`}>{submission.status.replaceAll("_", " ")}</span>
        </div>)}
        {submissions.length === 0 && <p>No submissions yet — <Link href="/submit">propose one</Link>.</p>}
      </section>

      {isReviewer ? <section>
        <h2>Reviews you&rsquo;ve given ({reviews.length})</h2>
        {reviews.map(({ review, claim, limit }) => <div className="own-submission" key={review.id}>
          <div>
            <strong>{claim.claimNumber} — {claim.relation} {claim.valueExact}</strong>
            <small>{limit.registryNumber} — {limit.title}</small>
          </div>
          <span className={`submission-status ${review.decision.toLowerCase()}`}>{review.decision.replaceAll("_", " ")}</span>
        </div>)}
        {reviews.length === 0 && <p>No reviews recorded yet.</p>}
      </section> : null}

      {isResearcher ? <section>
        <h2>Bounties you&rsquo;ve submitted ({bounties.length})</h2>
        {bounties.map(({ bounty, limit }) => <div className="own-submission" key={bounty.id}>
          <div>
            <strong>{bounty.title}</strong>
            <small>{limit ? `${limit.registryNumber} — ${limit.title}` : "Unlinked"}</small>
          </div>
          <span className={`submission-status ${bounty.status.toLowerCase()}`}>{bounty.status.replaceAll("_", " ")}</span>
        </div>)}
        {bounties.length === 0 && <p>No bounties submitted yet — <Link href="/console/research/bounties">submit one</Link>.</p>}
      </section> : null}
    </div>
    <SiteFooter />
  </main>;
}
