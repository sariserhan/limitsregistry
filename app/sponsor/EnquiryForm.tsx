"use client";
import { useState } from "react";
import { submitSponsorship } from "./actions";
import { BOUNTY_CURRENCIES } from "../../src/domain/bounties";
export function EnquiryForm({options}:{options:{id:string;registryNumber:string;title:string}[]}) {
  const [pending,setPending]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState(false);
  if(success) return <div className="submit-success" role="status"><h2>Enquiry received</h2><p>We will review the bounty and contact you with a quote. Nothing is published or charged by submitting this form.</p></div>;
  return <form className="submit-form" onSubmit={async event=>{event.preventDefault();setPending(true);setError("");try{const result=await submitSponsorship(new FormData(event.currentTarget));if(result.error)setError(result.error);else setSuccess(true);}catch{setError("Could not submit. Please try again.");}finally{setPending(false);}}}>
    {error&&<p role="alert" className="submit-error">{error}</p>}
    <div className="submit-field"><label htmlFor="limitId">Published Limit</label><select id="limitId" name="limitId" required defaultValue=""><option value="">Choose a Limit from the search results</option>{options.map(option=><option key={option.id} value={option.id}>{option.registryNumber} — {option.title}</option>)}</select></div>
    <div className="submit-field"><label htmlFor="title">Bounty title</label><input id="title" name="title" required minLength={3} maxLength={200}/></div>
    <div className="submit-field"><label htmlFor="sponsor">Sponsor name</label><input id="sponsor" name="sponsor" required minLength={2} maxLength={160}/></div>
    <div className="submit-field"><label htmlFor="sponsorUrl">Sponsor website</label><input id="sponsorUrl" name="sponsorUrl" type="url" required maxLength={2000} placeholder="https://example.org"/></div>
    <div className="submit-field"><label htmlFor="contactEmail">Contact email (private)</label><input id="contactEmail" name="contactEmail" type="email" required maxLength={254}/></div>
    <div className="submit-field"><label htmlFor="amount">Bounty award amount</label><input id="amount" name="amount" required inputMode="decimal" pattern="[0-9]{1,8}(\.[0-9]{1,2})?"/><small>This is the award you pay the claimant directly. The listing fee is quoted separately.</small></div>
    <div className="submit-field"><label htmlFor="currency">Award currency</label><select id="currency" name="currency" defaultValue="USD">{BOUNTY_CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="submit-field"><label htmlFor="expiresAt">Award expiry (optional)</label><input id="expiresAt" name="expiresAt" type="date"/></div>
    <div className="submit-field"><label htmlFor="sourceUrl">Official award terms URL</label><input id="sourceUrl" name="sourceUrl" type="url" required maxLength={2000} placeholder="https://example.org/award-terms"/></div>
    <div className="submit-field"><label htmlFor="description">Award terms and eligibility</label><textarea id="description" name="description" required minLength={20} maxLength={5000} rows={6}/></div>
    <label className="submit-check"><input type="checkbox" name="acknowledgement" required/>I understand that editorial approval is independent, the listing fee buys a time-limited sponsor panel, and I administer and pay the bounty award directly.</label>
    <button className="submit-submit" disabled={pending||!options.length}>{pending?"Sending…":"Request a sponsorship quote"}</button>
  </form>;
}
