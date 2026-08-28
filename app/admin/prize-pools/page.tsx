import Link from "next/link";
import { listBounties } from "../../../src/db/repository.research";
export default async function AdminPrizePoolsPage() {
  const bounties = await listBounties();
  const pending = bounties.filter((bounty) => bounty.status === "UNVERIFIED");
  return <section className="admin-section"><h2>Prize-pool proposals</h2><p>Admin triage queue: check that each proposal is complete, serious, and routed to the Editorial team. Admin review does not publish a bounty; only an editor can verify it.</p>
    {pending.length ? pending.map((bounty) => <article className="admin-panel" key={bounty.id}><div className="admin-application-head"><div><strong>{bounty.title}</strong><small>{bounty.sponsor} · submitted {bounty.createdAt.toLocaleDateString()}</small></div><span className="status-badge warn">UNVERIFIED</span></div><p><b>Linked Limit:</b> {bounty.limit?.registryNumber ?? "Unlinked"} — {bounty.limit?.title ?? "Not found"}</p><p><b>Pool:</b> {bounty.amount && bounty.currency ? bounty.amount + " " + bounty.currency : "Not specified"} · <b>Expires:</b> {bounty.expiresAt ? bounty.expiresAt.toLocaleDateString() : "No expiration"}</p><p>{bounty.description}</p><a href={bounty.sourceUrl} target="_blank" rel="noreferrer">Open terms or evidence ↗</a><p><Link href="/console/research/bounties">Open Editorial moderation queue ↗</Link></p></article>) : <p>No prize-pool proposals are waiting for Admin triage.</p>}
    <p><Link href="/bounties">View the public verified bounty tracker ↗</Link></p></section>;
}
