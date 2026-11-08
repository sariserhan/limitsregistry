import type { Metadata } from "next";
import { pageMetadata } from "../../src/domain/seo";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listAllPublicLimitOptions } from "../../src/db/repository.public-limits";
import { listSponsorableCategories } from "../../src/db/repository.sponsorships";
import { Suspense } from "react";
import { SponsorshipNav } from "./SponsorshipNav";
import { RegularEnquiryFromQuery, SponsorshipNavFromQuery } from "./SponsorQuery";
import "../submit/submit.css";
export const metadata: Metadata = pageMetadata({ path: "/sponsor", title: "Regular sponsorship — Limits Registry" });
// Static: ?category= / ?record= / ?q= are read in the browser (see SponsorQuery.tsx).
export default async function SponsorPage() {
  const [options, categories] = await Promise.all([listAllPublicLimitOptions(), listSponsorableCategories()]);
  return <main className="submit-page"><PublicHeader/><div className="submit-content">
    <Suspense fallback={<SponsorshipNav active="regular"/>}><SponsorshipNavFromQuery active="regular" categories={categories}/></Suspense>
    <h1>Sponsor the registry</h1>
    <p>Put your organisation alongside the records and research fields you care about. Enquire about a clearly labelled placement on a record, across a category, or elsewhere in the registry.</p>
    <p>Placement, duration, and pricing are agreed individually. Regular sponsorship does not require a research prize or award terms, and does not influence verification, editorial decisions, or search ranking.</p>
    <p>Want to offer a prize for research? Choose <Link href="/sponsor/bounties">bounty sponsorship</Link> instead.</p>
    <p>Contact and commercial details stay private. See our <Link href="/privacy">privacy policy</Link>.</p>
    <Suspense fallback={<p>Loading the enquiry form…</p>}><RegularEnquiryFromQuery options={options} categories={categories}/></Suspense>
  </div><SiteFooter/></main>;
}
