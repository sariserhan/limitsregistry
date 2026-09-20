import Link from "next/link";
import "./sponsor.css";
export function SponsorshipNav({ active, category, record }: { active: "regular" | "bounty"; category?: string; record?: string }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  else if (record) params.set("record", record);
  const suffix = params.size ? `?${params}` : "";
  return <nav className="sponsorship-sections" aria-label="Sponsorship options">
    <Link href={`/sponsor${suffix}`} aria-current={active === "regular" ? "page" : undefined}><strong>Regular sponsorship</strong><span>Discuss a sponsor placement for your organisation.</span></Link>
    <Link href={`/sponsor/bounties${suffix}`} aria-current={active === "bounty" ? "page" : undefined}><strong>Bounty sponsorship</strong><span>Offer a research prize and sponsor its visibility.</span></Link>
  </nav>;
}
