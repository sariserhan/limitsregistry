import Link from "next/link";
import { requireRole } from "../../../src/auth/session";
import { listSponsorships, listSponsorableCategories } from "../../../src/db/repository.sponsorships";
import { SPONSORSHIP_DAYS } from "../../../src/domain/bounty-sponsorship";
import { Controls } from "./Controls";
import "./sponsorships.css";
export default async function SponsorshipsPage(){
  await requireRole("ADMIN");const [rows,categories]=await Promise.all([listSponsorships(),listSponsorableCategories()]);const now=new Date().getTime();
  return <section className="sponsorship-admin"><h2>Bounty sponsorships</h2><p><Link href="/admin/sponsorships/regular">View regular sponsorship enquiries →</Link></p><p>Manual quotes, invoices and payment records. No funds move through these controls. Independent <Link href="/console/research/bounties">editorial verification</Link> must precede invoicing.</p>
    {!rows.length&&<p>No sponsorship enquiries yet.</p>}
    {rows.map(({term,bounty,limit})=>{const previousEnd=rows.filter(row=>row.term.bountyId===term.bountyId&&row.term.status==="PAID").reduce((end,row)=>Math.max(end,row.term.endsAt?.getTime()??0),now);const start=new Date(previousEnd),end=new Date(Math.min(previousEnd+SPONSORSHIP_DAYS*86400000,bounty.expiresAt?.getTime()??Infinity));return <article key={term.id}><h3>{bounty.title}</h3><p>{bounty.sponsor} · {term.status} · Editorial: {bounty.status}</p><p>{bounty.category?`Entire category: ${bounty.category} · ${categories.find(item=>item.category===bounty.category)?.count??0} published Limits currently · current and future published Limits · one shared award pool`:limit?`${limit.registryNumber} — ${limit.title} (${limit.status})`:"Linked Limit unavailable"}</p><p>Contact: {term.contactEmail} · <a href={term.sponsorUrl} target="_blank" rel="noopener noreferrer">Sponsor website</a></p><p>Term ID: {term.id}</p><p>Invoice: {term.invoiceReference??"Not issued"} · Listing fee: {term.feeAmount??"Not quoted"} {term.feeCurrency}</p><p>Paid: {term.paidAt?.toISOString()??"Not recorded"} · Placement: {term.startsAt?.toISOString()??"Not scheduled"} → {term.endsAt?.toISOString()??"Not scheduled"}</p>{term.resolutionNote&&<p>Resolution: {term.resolutionNote}</p>}{term.refundReference&&<p>Refund: {term.refundReference}</p>}
      <Controls id={term.id} status={term.status} paid={!!term.paidAt} start={start.toISOString().slice(0,16)} end={end.toISOString().slice(0,16)}/></article>;})}
  </section>;
}
