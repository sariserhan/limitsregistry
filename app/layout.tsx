import Script from "next/script";

import type { Metadata } from "next";
import "./globals.css";
import "./canonical.css";
import { getSiteSettingsSafe } from "../src/db/repository.settings";
import { AnnouncementBanner } from "../src/components/announcement-banner";
import { MaintenanceGate } from "../src/components/maintenance-gate";
import { AdminModeBanner } from "../src/components/admin-mode-banner";
import { AcquisitionTracker } from "../src/components/acquisition-tracker";
import { SITE_URL } from "../src/domain/seo";

const SITE_TITLE = "Limits Registry — The verified boundaries of what is possible";
const SITE_DESCRIPTION = "A curated public record of the verified boundaries of what is possible.";

export const metadata: Metadata = {
  // Lets per-page metadata use relative URLs (alternates.canonical, openGraph.url, image src) and
  // have them resolve to absolute www.limitsregistry.com URLs — required for OG/Twitter tags,
  // which only accept absolute URLs.
  metadataBase: new URL(SITE_URL),
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // No og:url here: a page without its own openGraph would otherwise declare itself to be the
  // homepage. Public pages set canonical + og:url together through pageMetadata (src/domain/seo).
  openGraph: { type: "website", siteName: "Limits Registry", title: SITE_TITLE, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

// Nothing in this layout may read the request (headers(), cookies(), the session). It wraps every
// route, so a single request-time read here makes the whole site uncacheable: every page view,
// prefetch and crawler hit becomes a function invocation plus database reads. That is what let one
// scraper turn into a 29x invocation spike on 2026-11-06. The per-visitor parts (admin banner,
// maintenance bypass by path) are client components instead.
//
// The ceiling for pages that declare nothing themselves, which used to be implicitly dynamic.
// Publishing and settings changes invalidate by tag, so this only bounds untagged reads.
export const revalidate = 3600;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettingsSafe();

  return <html lang="en" data-scroll-behavior="smooth"><body suppressHydrationWarning>
    <AdminModeBanner />
    <AcquisitionTracker />
    <MaintenanceGate enabled={settings.maintenanceEnabled} message={settings.maintenanceMessage} announcement={settings.announcementEnabled ? <AnnouncementBanner message={settings.announcementMessage} level={settings.announcementLevel} /> : null}>
      {children}
    </MaintenanceGate>
    <Script
      src="https://cdn.visitorping.com/site/vp_PBTR9YAZ.js"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  </body></html>;
}
