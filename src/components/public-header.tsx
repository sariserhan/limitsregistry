import Link from "next/link";
import "./sponsor-callout.css";
import { BrandIcon } from "./brand-icon";
import { HeaderAccountLink } from "./header-account-link";

const links = [
  ["Registry", "/"],
  ["Sponsor", "/sponsor"],
  ["Open Limits", "/open-limits"],
  ["Search", "/search"],
  ["Graph", "/dependencies"],
  ["Breakthroughs", "/breakthroughs"],
  ["Challenges", "/activity"],
  ["Bounties", "/bounties"],
] as const;

// prefetch={false} throughout: these links are on every page, so default prefetching turned one
// page render by a JavaScript-running scraper into ten more function invocations. /console was
// the worst of them — a prefetch that the proxy redirects to /login for anyone signed out.
export function PublicHeader() {
  return <header className="public-header">
    <Link className="brand" href="/" prefetch={false} aria-label="Limits Registry home"><BrandIcon className="brand-mark" size={44} /><span>Limits Registry</span></Link>
    <nav aria-label="Primary navigation">{links.map(([label, href]) => <Link href={href} key={href} prefetch={false} className={href === "/sponsor" ? "public-header-sponsor" : undefined}>{label}</Link>)}</nav>
    <div className="public-header-actions">
      <HeaderAccountLink />
      <Link className="public-header-console" href="/console" prefetch={false}><span/>Research Console →</Link>
    </div>
  </header>;
}
