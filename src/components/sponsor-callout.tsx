import Link from "next/link";
import "./sponsor-callout.css";

type SponsorCalloutProps = {
  category?: string;
  record?: string;
  context?: "record" | "bounty" | "category" | "research";
  compact?: boolean;
  heading?: string;
};

export function sponsorEnquiryHref({ category, record, bounty = false }: { category?: string | null; record?: string; bounty?: boolean }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  else if (record) params.set("record", record);
  const path = bounty ? "/sponsor/bounties" : "/sponsor";
  return params.size ? `${path}?${params}` : path;
}

export function SponsorCallout({ category, record, context = "record", compact = false, heading = "Put your name behind the next discovery." }: SponsorCalloutProps) {
  const label = context === "category" ? "Sponsor this category" : context === "bounty" ? "Sponsor a bounty" : context === "research" ? "Sponsor this research" : "Sponsor this record";
  return <div className={`sponsor-callout${compact ? " sponsor-callout-compact" : ""}`}>
    <span className="sponsor-callout-kicker">Become a sponsor</span>
    <strong>{heading}</strong>
    <p>{context === "category"
      ? "Get your organisation seen across this category, with your name and link on its published records."
      : "Reach people exploring this research with a visible sponsor panel for your organisation."}</p>
    <Link href={sponsorEnquiryHref({ category, record, bounty: context === "bounty" })}>{label} <span aria-hidden="true">↗</span></Link>
    <small>Paid placement for an agreed term. Subject to independent review.</small>
  </div>;
}
