import Script from "next/script";

import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./canonical.css";
import { getSiteSettings } from "../src/db/repository.settings";
import { AnnouncementBanner } from "../src/components/announcement-banner";
import { MaintenanceScreen } from "../src/components/maintenance-screen";
import { AdminModeBanner } from "../src/components/admin-mode-banner";
import { getSession } from "../src/auth/session";
import { hasRole, type Role } from "../src/auth/permissions";

const SITE_URL = "https://www.limitsregistry.com";
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
  openGraph: { type: "website", siteName: "Limits Registry", title: SITE_TITLE, description: SITE_DESCRIPTION, url: SITE_URL },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

// Always allowed through, even during maintenance — otherwise an admin could lock themselves
// out with no way back in (can't sign in, can't reach /admin to turn it back off).
const MAINTENANCE_BYPASS_PREFIXES = ["/admin", "/login"];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [requestHeaders, settings, session] = await Promise.all([headers(), getSiteSettings(), getSession()]);
  const pathname = requestHeaders.get("x-pathname") ?? "";
  const bypassMaintenance = MAINTENANCE_BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const showMaintenance = settings.maintenanceEnabled && !bypassMaintenance;
  const isAdmin = hasRole(session?.user.role as Role, "ADMIN");

  return <html lang="en" data-scroll-behavior="smooth"><body suppressHydrationWarning>
    {isAdmin && <AdminModeBanner />}
    {!showMaintenance && settings.announcementEnabled && <AnnouncementBanner message={settings.announcementMessage} level={settings.announcementLevel} />}
    {showMaintenance ? <MaintenanceScreen message={settings.maintenanceMessage} /> : children}
    <Script
      src="https://cdn.visitorping.com/site/vp_PBTR9YAZ.js"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  </body></html>;
}
