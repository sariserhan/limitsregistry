"use client";

import { useState } from "react";
import Link from "next/link";
import { requestApiAccess } from "./actions";

export function AccessForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <div className="info-note" role="status"><strong>Request received.</strong><p>We’ll review your requirements and reply by email to discuss pricing, snapshot freshness, and next steps. Access begins after we agree the pilot terms and issue your key.</p><Link href="/developers">Back to API documentation →</Link></div>;
  return <form className="contact-form api-access-form" onSubmit={async (event) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const result = await requestApiAccess(data);
      if (result.error) setError(result.error);
      else setSent(true);
    } catch { setError("Your request could not be sent. Please try again."); }
    finally { setPending(false); }
  }}>
    <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={200} /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label>Organisation or project<input name="organization" autoComplete="organization" required maxLength={200} /></label>
    <label>What are you building?<textarea name="useCase" required minLength={20} maxLength={4000} rows={5} placeholder="Describe how you plan to use the registry data." /></label>
    <label>Expected data volume and download frequency<input name="volume" required maxLength={500} placeholder="e.g. the full registry, downloaded weekly; unsure is fine" /></label>
    <label>How fresh does the data need to be?<input name="freshness" required maxLength={500} placeholder="e.g. monthly releases, or after each editorial update" /></label>
    <p className="api-form-note">This is a manually reviewed pilot with agreed pricing. Snapshots are published manually; there is no guaranteed update schedule. Your request is private to administrators. See our <Link href="/privacy">privacy policy</Link>.</p>
    {error && <p className="contact-error" role="alert">{error}</p>}
    <button type="submit" className="contact-submit" disabled={pending}>{pending ? "Sending…" : "Request pilot access"}</button>
  </form>;
}
