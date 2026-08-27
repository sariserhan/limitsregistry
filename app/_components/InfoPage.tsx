import Link from "next/link";
import type { ReactNode } from "react";
import { BrandIcon } from "../../src/components/brand-icon";

export default function InfoPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="info-page">
      <header className="info-header">
        <Link className="brand" href="/">
          <BrandIcon className="brand-mark" />
          <span>Limits Registry</span>
        </Link>
        <Link href="/">Back to registry ↗</Link>
      </header>
      {/* header/footer only get the implicit banner/contentinfo landmark roles when they aren't
         nested inside main — keeping main scoped to just the actual content preserves those
         landmarks for screen-reader navigation. */}
      <main>
        <article className="info-content">
          <p className="section-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="info-intro">{intro}</p>
          <div className="info-body">{children}</div>
        </article>
      </main>
      <footer>
        <span>LR / 2026</span>
        <span>Evidence before assertion.</span>
        <Link href="/support">Support ↗</Link>
      </footer>
    </div>
  );
}

