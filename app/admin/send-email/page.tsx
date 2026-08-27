import { listRecentAdminSentEmails } from "../../../src/db/repository.admin-email";
import { sendAdminEmail } from "./actions";

export default async function AdminSendEmailPage() {
  const recent = await listRecentAdminSentEmails(5);

  return <>
    <section className="admin-section">
      <h2>Send email</h2>
      <p>Sends a one-off email using the standard Limits Registry template. &ldquo;Hello&rdquo; is the greeting shown at the top of the message; the body is the main text.</p>
      <form action={sendAdminEmail} className="admin-form">
        <label>From<select name="from" defaultValue="support"><option value="support">Limits Registry &lt;support@limitsregistry.com&gt;</option><option value="welcome">Limits Registry &lt;welcome@limitsregistry.com&gt;</option></select></label>
        <label>To<input type="email" name="toEmail" required placeholder="person@example.com" /></label>
        <label>Subject<input type="text" name="subject" required /></label>
        <label>Hello<input type="text" name="heading" required placeholder="Hello Jane," /></label>
        <label>Body<textarea name="body" required placeholder="Main message…" /></label>
        <label>Footer (optional)<textarea name="footerNote" placeholder="A closing note shown below the body." /></label>
        <button type="submit" className="admin-submit">Send email</button>
      </form>
    </section>

    <section className="admin-section">
      <h2>Recently sent</h2>
      {recent.length === 0 && <p>No admin-composed emails sent yet.</p>}
      {recent.map((email) => <div className="admin-status-row" key={email.id}>
        <div><strong>{email.subject}</strong><br /><small>to {email.toEmail} · {new Date(email.createdAt).toLocaleString()}</small></div>
      </div>)}
    </section>
  </>;
}
