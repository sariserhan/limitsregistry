import Link from "next/link";
import "./sponsor-callout.css";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-sponsor"><div><strong>Make your support visible.</strong><p>Put your organisation alongside the research and frontiers you care about.</p></div><Link href="/sponsor">Become a sponsor ↗</Link></div>
    <span>LR / 2026</span>
    <span>Evidence before assertion.</span>
    <span className="footer-links">
      <Link href="/about">About</Link>
      <Link href="/articles">Articles</Link>
      <Link href="/researchers">Researchers</Link>
      <Link href="/collections">Collections</Link>
      <Link href="/graph">Knowledge graph</Link>
      <Link href="/methodology">Methodology</Link>
      <Link href="/compare">Compare</Link>
      <Link href="/certificates/preview">Certificate preview</Link>
      <Link href="/editorial-policy">Editorial policy</Link>
      <Link href="/developers">API &amp; Data</Link>
      <Link href="/support">Support</Link>
      <Link href="/sponsor">Sponsor</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
    </span>
  </footer>;
}
