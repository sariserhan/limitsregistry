import { submitInboxMessage } from "./actions";

export function ContactForm({ channel, sent }: { channel: "CONTACT" | "SUPPORT"; sent?: boolean }) {
  if (sent) {
    return <div className="info-note"><strong>Thanks — your message was sent.</strong> We&apos;ll reply by email.</div>;
  }
  return <form action={submitInboxMessage} className="contact-form">
    <input type="hidden" name="channel" value={channel} />
    <label>Name<input name="name" required minLength={2} /></label>
    <label>Email<input type="email" name="email" required /></label>
    <label>Subject (optional)<input name="subject" /></label>
    <label>Message<textarea name="message" required minLength={10} rows={5} /></label>
    <button type="submit" className="contact-submit">Send message</button>
  </form>;
}
