import Link from "next/link";
import type { ReactNode } from "react";
import { BrandIcon } from "../../src/components/brand-icon";

export default function InfoPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main className="info-page">
      <header className="info-header">
        <Link className="brand" href="/">
          <BrandIcon className="brand-mark" />
          <span>Limits Registry</span>
        </Link>
        <Link href="/">Back to registry ↗</Link>
      </header>
      <article className="info-content">
        <p className="section-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="info-intro">{intro}</p>
        <div className="info-body">{children}</div>
      </article>
      <footer>
        <span>LR / 2026</span>
        <span>Evidence before assertion.</span>
        <Link href="/support">Support ↗</Link>
      </footer>
    </main>
  );
}

