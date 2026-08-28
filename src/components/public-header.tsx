import Link from "next/link";
import { BrandIcon } from "./brand-icon";
import { HeaderAccountLink } from "./header-account-link";

const links = [
  ["Registry", "/"],
  ["Open Limits", "/open-limits"],
  ["Search", "/search"],
  ["Graph", "/dependencies"],
  ["Breakthroughs", "/breakthroughs"],
  ["Challenges", "/activity"],
  ["Compare", "/compare"],
  ["Bounties", "/bounties"],
  ["Articles", "/articles"],
  ["Methodology", "/methodology"],
] as const;

export function PublicHeader() {
  return <header className="public-header">
    <Link className="brand" href="/" aria-label="Limits Registry home"><BrandIcon className="brand-mark" size={24} /><span>Limits Registry</span></Link>
    <nav aria-label="Primary navigation">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    <div className="public-header-actions">
      <HeaderAccountLink />
      <Link className="public-header-console" href="/console"><span/>Research Console →</Link>
    </div>
  </header>;
}
