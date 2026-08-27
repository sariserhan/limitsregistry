import Link from "next/link";
import type { ReactNode } from "react";
import { PublicHeader } from "../../src/components/public-header";

export default function InfoPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main className="info-page">
      <PublicHeader />
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

