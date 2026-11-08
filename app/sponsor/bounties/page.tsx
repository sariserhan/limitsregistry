import type { Metadata } from "next";
import { pageMetadata } from "../../../src/domain/seo";
import { SponsorshipNav } from "../SponsorshipNav";
import Link from "next/link";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { listAllPublicLimitOptions } from "../../../src/db/repository.public-limits";
import { listSponsorableCategories } from "../../../src/db/repository.sponsorships";
import { Suspense } from "react";
import { BountyEnquiryFromQuery, SponsorshipNavFromQuery } from "../SponsorQuery";
import "../../submit/submit.css";
export const metadata: Metadata = pageMetadata({ path: "/sponsor/bounties", title: "Sponsor a research bounty — Limits Registry" });
// Static: ?category= / ?record= / ?q= are read in the browser (see SponsorQuery.tsx).
export default async function SponsorPage() {
  const [options,categories]=await Promise.all([listAllPublicLimitOptions(),listSponsorableCategories()]);
  return <main className="submit-page"><PublicHeader/><div className="submit-content"><Suspense fallback={<SponsorshipNav active="bounty"/>}><SponsorshipNavFromQuery active="bounty" categories={categories}/></Suspense><h1>Sponsor a research bounty</h1>
    <p>Support work on a specific Limit or an entire category with a clearly labelled sponsor panel and a link to your organisation. We quote listing fees individually; the standard term is 90 days, nonexclusive, with no automatic renewal.</p>
    <p>Ordinary verified bounty listings are free. Sponsorship does not buy editorial approval, research results, or priority in search. The panel ends with your agreed term; the ordinary listing and sponsor attribution remain subject to editorial review and award expiry.</p>
    <p>You publish the award terms and pay successful claimants directly. Limits Registry does not hold or distribute award funds. Cancellation ends placement; any refund must be agreed and handled manually under your invoice terms.</p>
    <p><Link href="/bounties/propose">Submit a free ordinary bounty listing →</Link></p>
    <p>Contact and invoice details stay private. See our <Link href="/privacy">privacy policy</Link>.</p>
    <Suspense fallback={<p>Loading the enquiry form…</p>}><BountyEnquiryFromQuery options={options.map(({id,registryNumber,title,category})=>({id,registryNumber,title,category}))} categories={categories}/></Suspense>
  </div><SiteFooter/></main>;
}
