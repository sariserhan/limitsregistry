import { InboxList } from "../InboxList";

export default function AdminSupportPage() {
  return <section className="admin-section">
    <h2>Support</h2>
    <p>Messages submitted via the public /support form. Replies are sent by email to the sender.</p>
    <InboxList channel="SUPPORT" returnPath="/admin/support" />
  </section>;
}
