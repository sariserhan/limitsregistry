import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { siteSettings } from "./schema";

const SETTINGS_ID = "global";
const DEFAULTS = { id: SETTINGS_ID, maintenanceEnabled: false, maintenanceMessage: null, announcementEnabled: false, announcementMessage: null, announcementLevel: "INFO" as const };

export const getSiteSettings = unstable_cache(
  async () => { const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID)).limit(1); return rows[0] ?? DEFAULTS; },
  ["site-settings"],
  { revalidate: 30, tags: ["site-settings"] },
);

export type SiteSettingsInput = { maintenanceEnabled: boolean; maintenanceMessage: string | null; announcementEnabled: boolean; announcementMessage: string | null; announcementLevel: "INFO" | "WARNING" | "CRITICAL" };

export async function updateSiteSettings(input: SiteSettingsInput, actorUserId: string) {
  await db.insert(siteSettings).values({ id: SETTINGS_ID, ...input, updatedByUserId: actorUserId }).onConflictDoUpdate({ target: siteSettings.id, set: { ...input, updatedAt: new Date(), updatedByUserId: actorUserId } });
  // { expire: 0 } (not the recommended "max" profile) — a maintenance/announcement toggle must
  // apply to the very next request, not serve one more stale response while revalidating in the
  // background. See node_modules/next/dist/docs/.../revalidateTag.md's "needs data gone immediately" case.
  revalidateTag("site-settings", { expire: 0 });
}
