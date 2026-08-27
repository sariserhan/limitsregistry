"use client";

import { useActionState } from "react";
import { submitInboxMessage } from "./actions";

export function ContactForm({ channel, sent }: { channel: "CONTACT" | "SUPPORT"; sent?: boolean }) {
  const [state, formAction, pending] = useActionState(submitInboxMessage, undefined);
  if (sent) {
    return <div className="info-note"><strong>Thanks — your message was sent.</strong> We&apos;ll reply by email.</div>;
  }
  return <form action={formAction} className="contact-form">
    <input type="hidden" name="channel" value={channel} />
    <label>Name<input name="name" required minLength={2} /></label>
    <label>Email<input type="email" name="email" required /></label>
    <label>Subject (optional)<input name="subject" /></label>
    <label>Message<textarea name="message" required minLength={10} rows={5} /></label>
    {state?.error && <p className="contact-error" role="alert">{state.error}</p>}
    <button type="submit" className="contact-submit" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
  </form>;
}
