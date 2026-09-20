import Link from "next/link";
import "./sponsor-callout.css";

type SponsorCalloutProps = {
  category?: string;
  record?: string;
  context?: "record" | "bounty" | "category";
  compact?: boolean;
};

export function sponsorEnquiryHref({ category, record }: { category?: string | null; record?: string }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  else if (record) params.set("record", record);
  return params.size ? `/sponsor?${params}` : "/sponsor";
}

export function SponsorCallout({ category, record, context = "record", compact = false }: SponsorCalloutProps) {
  const label = context === "category" ? "Sponsor this category" : context === "bounty" ? "Sponsor this research" : "Sponsor this record";
  return <div className={`sponsor-callout${compact ? " sponsor-callout-compact" : ""}`}>
    <span className="sponsor-callout-kicker">Become a sponsor</span>
    <strong>Put your name behind the next discovery.</strong>
    <p>{context === "category"
      ? "Get your organisation seen across this category, with your name and link on its published records."
      : "Reach people exploring this research with a visible sponsor panel for your organisation."}</p>
    <Link href={sponsorEnquiryHref({ category, record })}>{label} <span aria-hidden="true">↗</span></Link>
    <small>Paid placement for an agreed term. Subject to independent review.</small>
  </div>;
}
