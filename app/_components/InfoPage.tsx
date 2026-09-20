import { SponsorCallout } from "../../src/components/sponsor-callout";
import type { ReactNode } from "react";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";

export default function InfoPage({ kicker, title, intro, children, sponsorRecord }: { kicker: string; title: string; intro: string; children: ReactNode; sponsorRecord?: string }) {
  return (
    <div className="info-page">
      <PublicHeader />
      {/* header/footer only get the implicit banner/contentinfo landmark roles when they aren't
         nested inside main — keeping main scoped to just the actual content preserves those
         landmarks for screen-reader navigation. */}
      <main>
        <article className="info-content">
          <p className="section-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="info-intro">{intro}</p>
          <div className="info-body">{children}</div>
          {sponsorRecord ? <SponsorCallout record={sponsorRecord} context="research" compact /> : null}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

