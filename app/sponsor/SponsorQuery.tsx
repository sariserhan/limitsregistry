"use client";

import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "./EnquiryForm";
import type { PublishedLimitOption } from "./PublishedLimitPicker";
import { RegularEnquiryForm } from "./RegularEnquiryForm";
import { SponsorshipNav } from "./SponsorshipNav";

type Category = { category: string; count: number };

// The sponsor pages are linked from every record as /sponsor?record=..., which gave crawlers one
// uncacheable URL per record, each loading every published Limit from the database. Reading the
// query here, in the browser, lets each page be built once and served from cache for every
// variant. Render these inside <Suspense>; the fallback is what the cached HTML contains.
function useSponsorQuery(categories: Category[]) {
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  return {
    category: categories.some(item => item.category === category) ? category : "",
    record: (params.get("record") ?? "").trim().slice(0, 120),
    q: (params.get("q") ?? "").slice(0, 200),
  };
}

export function SponsorshipNavFromQuery({ active, categories }: { active: "regular" | "bounty"; categories: Category[] }) {
  const { category, record } = useSponsorQuery(categories);
  return <SponsorshipNav active={active} category={category} record={record || undefined} />;
}

export function RegularEnquiryFromQuery({ options, categories }: { options: PublishedLimitOption[]; categories: Category[] }) {
  const { category, record, q } = useSponsorQuery(categories);
  const selected = options.find(item => item.registryNumber === record);
  return <RegularEnquiryForm key={category || selected?.id || "new"} options={options} categories={categories} initialCategory={category} initialLimitId={selected?.id} initialQuery={q} />;
}

export function BountyEnquiryFromQuery({ options, categories }: { options: PublishedLimitOption[]; categories: Category[] }) {
  const { category, record, q } = useSponsorQuery(categories);
  const selected = options.find(item => item.registryNumber === record);
  return <EnquiryForm key={category || selected?.id || "new"} options={options} categories={categories} initialCategory={category} initialLimitId={category ? "" : selected?.id} initialQuery={q} />;
}
