"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../../src/auth/session";
import { updateSiteSettings } from "../../../src/db/repository.settings";

export async function saveSiteSettings(formData: FormData) {
  const session = await requireRole("ADMIN");
  const announcementLevel = String(formData.get("announcementLevel") ?? "INFO");
  await updateSiteSettings({
    maintenanceEnabled: formData.get("maintenanceEnabled") === "on",
    maintenanceMessage: String(formData.get("maintenanceMessage") ?? "").trim() || null,
    announcementEnabled: formData.get("announcementEnabled") === "on",
    announcementMessage: String(formData.get("announcementMessage") ?? "").trim() || null,
    announcementLevel: announcementLevel === "WARNING" || announcementLevel === "CRITICAL" ? announcementLevel : "INFO",
  }, session.user.id);
  revalidatePath("/admin/settings");
}
