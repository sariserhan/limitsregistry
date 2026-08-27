import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./canonical.css";
import { getSiteSettings } from "../src/db/repository.settings";
import { AnnouncementBanner } from "../src/components/announcement-banner";
import { MaintenanceScreen } from "../src/components/maintenance-screen";

export const metadata: Metadata = {
  title: "Limits Registry — The verified boundaries of what is possible",
  description: "A curated public record of mathematical and theoretical computer science limits.",
};

// Always allowed through, even during maintenance — otherwise an admin could lock themselves
// out with no way back in (can't sign in, can't reach /admin to turn it back off).
const MAINTENANCE_BYPASS_PREFIXES = ["/admin", "/login"];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [requestHeaders, settings] = await Promise.all([headers(), getSiteSettings()]);
  const pathname = requestHeaders.get("x-pathname") ?? "";
  const bypassMaintenance = MAINTENANCE_BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const showMaintenance = settings.maintenanceEnabled && !bypassMaintenance;

  return <html lang="en"><body>
    {!showMaintenance && settings.announcementEnabled && <AnnouncementBanner message={settings.announcementMessage} level={settings.announcementLevel} />}
    {showMaintenance ? <MaintenanceScreen message={settings.maintenanceMessage} /> : children}
  </body></html>;
}
