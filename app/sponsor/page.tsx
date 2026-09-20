import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listPublicLimitOptions } from "../../src/db/repository.public-limits";
import { listSponsorableCategories } from "../../src/db/repository.sponsorships";
import { EnquiryForm } from "./EnquiryForm";
import "../submit/submit.css";
export const dynamic="force-dynamic";
export const metadata={title:"Sponsor a research bounty — Limits Registry"};
export default async function SponsorPage({searchParams}:{searchParams:Promise<{q?:string;category?:string}>}) {
  const params=await searchParams;const q=typeof params.q==="string"?params.q.slice(0,200):"";
  const [options,categories]=await Promise.all([listPublicLimitOptions(q,50),listSponsorableCategories()]);
  const initialCategory=categories.some(item=>item.category===params.category)?params.category:"";
  return <main className="submit-page"><PublicHeader/><div className="submit-content"><h1>Sponsor a research bounty</h1>
    <p>Support work on a specific Limit or an entire category with a clearly labelled sponsor panel and a link to your organisation. We quote listing fees individually; the standard term is 90 days, nonexclusive, with no automatic renewal.</p>
    <p>Ordinary verified bounty listings are free. Sponsorship does not buy editorial approval, research results, or priority in search. The panel ends with your agreed term; the ordinary listing and sponsor attribution remain subject to editorial review and award expiry.</p>
    <p>You publish the award terms and pay successful claimants directly. Limits Registry does not hold or distribute award funds. Cancellation ends placement; any refund must be agreed and handled manually under your invoice terms.</p>
    <p><Link href="/bounties/propose">Submit a free ordinary bounty listing →</Link></p>
    <form className="submit-form" method="get"><div className="submit-field"><label htmlFor="q">Find a published Limit</label><input id="q" name="q" defaultValue={q} maxLength={200} placeholder="Search title or registry number"/></div><button className="submit-submit">Search Limits</button><small>Showing up to 50 matches. Search before completing the enquiry below.</small></form>
    {!options.length&&<p>No matching Limits. Try another search.</p>}
    <p>Contact and invoice details stay private. See our <Link href="/privacy">privacy policy</Link>.</p>
    <EnquiryForm categories={categories} initialCategory={initialCategory} options={options.map(({id,registryNumber,title})=>({id,registryNumber,title}))}/>
  </div><SiteFooter/></main>;
}
