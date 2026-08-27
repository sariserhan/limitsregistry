import { InboxList } from "../InboxList";

export default function AdminContactPage() {
  return <section className="admin-section">
    <h2>Contact</h2>
    <p>Messages submitted via the public /contact form. Replies are sent by email to the sender.</p>
    <InboxList channel="CONTACT" returnPath="/admin/contact" />
  </section>;
}
