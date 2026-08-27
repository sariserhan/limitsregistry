import { getSiteSettings } from "../../../src/db/repository.settings";
import { saveSiteSettings } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return <>
    <section className="admin-section">
      <h2>Site controls</h2>
      <p>Maintenance mode blocks every public page (except /login and this admin area) with a fallback screen. The announcement banner shows on every public page without blocking anything.</p>
      <form action={saveSiteSettings} className="admin-form">
        <label className="admin-form-row"><input type="checkbox" name="maintenanceEnabled" defaultChecked={settings.maintenanceEnabled} /> Enable maintenance mode</label>
        <label>Maintenance message<textarea name="maintenanceMessage" defaultValue={settings.maintenanceMessage ?? ""} placeholder="We're making some updates and will be back shortly." /></label>

        <label className="admin-form-row"><input type="checkbox" name="announcementEnabled" defaultChecked={settings.announcementEnabled} /> Enable site announcement</label>
        <label>Announcement message<textarea name="announcementMessage" defaultValue={settings.announcementMessage ?? ""} placeholder="Scheduled maintenance this weekend — see status page for details." /></label>
        <label>Announcement level<select name="announcementLevel" defaultValue={settings.announcementLevel}><option value="INFO">Info</option><option value="WARNING">Warning</option><option value="CRITICAL">Critical</option></select></label>

        <button type="submit" className="admin-submit">Save site controls</button>
      </form>
    </section>
  </>;
}
