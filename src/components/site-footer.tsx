import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer">
    <span>LR / 2026</span>
    <span>Evidence before assertion.</span>
    <span className="footer-links">
      <Link href="/about">About</Link>
      <Link href="/methodology">Methodology</Link>
      <Link href="/editorial-policy">Editorial policy</Link>
      <Link href="/support">Support</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
    </span>
  </footer>;
}
