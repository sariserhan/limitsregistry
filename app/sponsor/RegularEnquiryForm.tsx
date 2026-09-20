"use client";
import { useState } from "react";
import { PublishedLimitPicker, type PublishedLimitOption } from "./PublishedLimitPicker";
import { submitRegularSponsorship } from "./regular-actions";
export function RegularEnquiryForm({ options, categories, initialLimitId = "", initialCategory = "", initialQuery = "" }: { options: PublishedLimitOption[]; categories: { category: string; count: number }[]; initialLimitId?: string; initialCategory?: string; initialQuery?: string }) {
  const [scope, setScope] = useState(initialCategory ? "CATEGORY" : initialLimitId || initialQuery ? "LIMIT" : "REGISTRY");
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState(false);
  if (success) return <div className="submit-success" role="status"><h2>Sponsorship enquiry received</h2><p>We’ll contact you to discuss placement, availability, duration, and pricing. Nothing is published or charged by submitting this form.</p></div>;
  return <form className="submit-form" onSubmit={async event => {
    event.preventDefault(); if (pending) return;
    const data = new FormData(event.currentTarget); setPending(true); setError("");
    try { const result = await submitRegularSponsorship(data); if (result.error) setError(result.error); else setSuccess(true); }
    catch { setError("Could not submit. Please try again."); } finally { setPending(false); }
  }}>
    {error && <p role="alert" className="submit-error">{error}</p>}
    <div className="submit-field"><label htmlFor="scope">Where would you like to sponsor?</label><select id="scope" name="scope" value={scope} onChange={event => setScope(event.target.value)}><option value="REGISTRY">Registry-wide / discuss options</option><option value="LIMIT">One published Limit</option><option value="CATEGORY">Entire category</option></select></div>
    {scope === "LIMIT" && <PublishedLimitPicker options={options} initialLimitId={initialLimitId} initialQuery={initialQuery} />}
    {scope === "CATEGORY" && <div className="submit-field"><label htmlFor="category">Category</label><select id="category" name="category" required defaultValue={initialCategory}><option value="">Choose a category</option>{categories.map(item => <option key={item.category} value={item.category}>{item.category} — {item.count} published Limits</option>)}</select></div>}
    <div className="submit-field"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={200}/></div>
    <div className="submit-field"><label htmlFor="sponsor">Organisation</label><input id="sponsor" name="sponsor" autoComplete="organization" required minLength={2} maxLength={160}/></div>
    <div className="submit-field"><label htmlFor="sponsorUrl">Organisation website</label><input id="sponsorUrl" name="sponsorUrl" type="url" placeholder="https://example.org" required maxLength={2000}/></div>
    <div className="submit-field"><label htmlFor="contactEmail">Contact email (private)</label><input id="contactEmail" name="contactEmail" type="email" autoComplete="email" required maxLength={254}/></div>
    <div className="submit-field"><label htmlFor="message">What do you have in mind?</label><textarea id="message" name="message" required minLength={20} maxLength={5000} rows={5} placeholder="Tell us about your organisation, preferred placement, timing, and budget if known."/></div>
    <button className="submit-submit" disabled={pending}>{pending ? "Sending…" : "Enquire about regular sponsorship"}</button>
  </form>;
}
