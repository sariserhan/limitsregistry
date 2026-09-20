import Link from "next/link";
import { requireRole } from "../../../../src/auth/session";
import { InboxList } from "../../InboxList";
export default async function RegularSponsorshipsPage() {
  await requireRole("ADMIN");
  return <section className="admin-section"><h2>Regular sponsorship enquiries</h2><p>Discuss placement, availability, duration, and pricing directly. These enquiries do not create a bounty or publish a sponsor placement.</p><p><Link href="/admin/sponsorships">Manage bounty sponsorships →</Link></p><InboxList channel="CONTACT" returnPath="/admin/sponsorships/regular" subjectPrefix="Regular sponsorship — "/></section>;
}
