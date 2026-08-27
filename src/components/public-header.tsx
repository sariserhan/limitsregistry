import Link from "next/link";
import { BrandIcon } from "./brand-icon";

const links = [
  ["Registry", "/"],
  ["Open Limits", "/open-limits"],
  ["Search", "/search"],
  ["Graph", "/dependencies"],
  ["Breakthroughs", "/breakthroughs"],
  ["Bounties", "/bounties"],
  ["About", "/about"],
] as const;

export function PublicHeader({ large = false }: { large?: boolean } = {}) {
  return <header className="public-header">
    <Link className="brand" href="/" aria-label="Limits Registry home"><BrandIcon className={large ? "brand-mark brand-mark-lg" : "brand-mark"} size={large ? 32 : 24}/><span>Limits Registry</span></Link>
    <nav aria-label="Primary navigation">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    <Link className="public-header-console" href="/console"><span/>Research Console →</Link>
  </header>;
}
