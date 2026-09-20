import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listAllPublicLimitOptions } from "../../src/db/repository.public-limits";
import { listSponsorableCategories } from "../../src/db/repository.sponsorships";
import { RegularEnquiryForm } from "./RegularEnquiryForm";
import { SponsorshipNav } from "./SponsorshipNav";
import "../submit/submit.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Regular sponsorship — Limits Registry" };
export default async function SponsorPage({ searchParams }: { searchParams: Promise<{ category?: string; record?: string; q?: string }> }) {
  const params = await searchParams;
  const [options, categories] = await Promise.all([listAllPublicLimitOptions(), listSponsorableCategories()]);
  const initialCategory = categories.some(item => item.category === params.category) ? params.category : "";
  const selected = options.find(item => item.registryNumber === params.record);
  return <main className="submit-page"><PublicHeader/><div className="submit-content">
    <SponsorshipNav active="regular" category={initialCategory} record={selected?.registryNumber}/>
    <h1>Sponsor the registry</h1>
    <p>Put your organisation alongside the records and research fields you care about. Enquire about a clearly labelled placement on a record, across a category, or elsewhere in the registry.</p>
    <p>Placement, duration, and pricing are agreed individually. Regular sponsorship does not require a research prize or award terms, and does not influence verification, editorial decisions, or search ranking.</p>
    <p>Want to offer a prize for research? Choose <Link href="/sponsor/bounties">bounty sponsorship</Link> instead.</p>
    <p>Contact and commercial details stay private. See our <Link href="/privacy">privacy policy</Link>.</p>
    <RegularEnquiryForm key={initialCategory || selected?.id || "new"} options={options} categories={categories} initialCategory={initialCategory} initialLimitId={selected?.id} initialQuery={typeof params.q === "string" ? params.q.slice(0,200) : ""}/>
  </div><SiteFooter/></main>;
}
