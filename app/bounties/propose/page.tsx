import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { listAllLimits } from "../../../src/db/repository.console";
import { BOUNTY_CURRENCIES } from "../../../src/domain/bounties";
import { submitPrizePoolProposal } from "./actions";
import "../../submit/submit.css";
import "../bounties.css";
type Props = { searchParams: Promise<{ success?: string; error?: string }> };
export default async function ProposePrizePoolPage({ searchParams }: Props) {
  const session = await requireRole("USER");
  const [limits, params] = await Promise.all([listAllLimits(), searchParams]);
  return <main className="submit-page"><div className="submit-content">
    <p><Link href="/bounties">Back to Bounties</Link></p><p className="section-kicker">Fund an open frontier</p><h1>Propose a prize pool</h1>
    <p className="lede">A prize pool is a serious public commitment, not a promotional badge. Submit the problem, sponsor, amount, terms, and evidence. Admin checks completeness; an editor decides whether the listing is source-backed enough to publish.</p>
    <p className="submit-identity"><strong>Proposed by {session.user.name}</strong><small>This account identity is recorded with the proposal and shown to reviewers.</small></p>
    {(params.success || params.error) ? <p className={params.error ? "form-error" : "form-success"} role="status">{params.error ?? params.success}</p> : null}
    <form className="submit-form" action={submitPrizePoolProposal}>
      <div className="submit-field"><label htmlFor="limitId">Linked Limit</label><select id="limitId" name="limitId" required defaultValue=""><option value="" disabled>Choose the frontier this pool funds</option>{limits.map((limit) => <option value={limit.id} key={limit.id}>{limit.registryNumber} — {limit.title}</option>)}</select></div>
      <div className="submit-field"><label htmlFor="title">Prize pool title</label><input id="title" name="title" required minLength={3} maxLength={200} placeholder="e.g. A verified proof of ..." /></div>
      <div className="submit-field"><label htmlFor="sponsor">Sponsor or administering organization</label><input id="sponsor" name="sponsor" required minLength={2} maxLength={160} placeholder="Person, institute, company, or foundation" /></div>
      <div className="submit-field"><label htmlFor="amount">Prize pool amount</label><input id="amount" name="amount" required inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" placeholder="100000" /></div>
      <div className="submit-field"><label htmlFor="currency">Currency</label><select id="currency" name="currency" required defaultValue="USD">{BOUNTY_CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}</select></div>
      <div className="submit-field"><label htmlFor="expiresAt">Expiration (optional)</label><input id="expiresAt" name="expiresAt" type="date" /></div>
      <div className="submit-field"><label htmlFor="sourceUrl">Official terms or evidence URL</label><input id="sourceUrl" name="sourceUrl" type="url" pattern="https://.*" required placeholder="https://..." /><small>Link to sponsor terms, a funding commitment, or the authoritative page that lets reviewers verify the proposal.</small></div>
      <div className="submit-field"><label htmlFor="description">Terms, eligibility, and what counts as a solution</label><textarea id="description" name="description" required minLength={20} maxLength={5000} rows={7} placeholder="Who is eligible? What exact result earns the pool? Who administers payment? What is still undecided?" /></div>
      <label className="submit-check"><input name="reviewAcknowledgement" type="checkbox" required />I understand this proposal stays private and unverified until Admin triage and independent Editorial review are complete.</label><button className="submit-submit" type="submit">Send to review</button>
    </form></div></main>;
}
