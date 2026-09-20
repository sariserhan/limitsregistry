import { SponsorshipNav } from "../SponsorshipNav";
import Link from "next/link";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { listAllPublicLimitOptions } from "../../../src/db/repository.public-limits";
import { listSponsorableCategories } from "../../../src/db/repository.sponsorships";
import { EnquiryForm } from "../EnquiryForm";
import "../../submit/submit.css";
export const dynamic="force-dynamic";
export const metadata={title:"Sponsor a research bounty — Limits Registry"};
export default async function SponsorPage({searchParams}:{searchParams:Promise<{q?:string;category?:string;record?:string}>}) {
  const params=await searchParams;const q=typeof params.q==="string"?params.q.slice(0,200):"";
  const record=typeof params.record==="string"?params.record.trim().slice(0,120):"";
  const [options,categories]=await Promise.all([listAllPublicLimitOptions(),listSponsorableCategories()]);
  const selectedRecord=options.find(item=>item.registryNumber===record);
  const initialCategory=categories.some(item=>item.category===params.category)?params.category:"";
  return <main className="submit-page"><PublicHeader/><div className="submit-content"><SponsorshipNav active="bounty" category={params.category} record={record}/><h1>Sponsor a research bounty</h1>
    <p>Support work on a specific Limit or an entire category with a clearly labelled sponsor panel and a link to your organisation. We quote listing fees individually; the standard term is 90 days, nonexclusive, with no automatic renewal.</p>
    <p>Ordinary verified bounty listings are free. Sponsorship does not buy editorial approval, research results, or priority in search. The panel ends with your agreed term; the ordinary listing and sponsor attribution remain subject to editorial review and award expiry.</p>
    <p>You publish the award terms and pay successful claimants directly. Limits Registry does not hold or distribute award funds. Cancellation ends placement; any refund must be agreed and handled manually under your invoice terms.</p>
    <p><Link href="/bounties/propose">Submit a free ordinary bounty listing →</Link></p>
    <p>Contact and invoice details stay private. See our <Link href="/privacy">privacy policy</Link>.</p>
    <EnquiryForm key={initialCategory||selectedRecord?.id||"new"} initialLimitId={initialCategory?"":selectedRecord?.id} categories={categories} initialCategory={initialCategory} initialQuery={q} options={options.map(({id,registryNumber,title,category})=>({id,registryNumber,title,category}))}/>
  </div><SiteFooter/></main>;
}
