"use client";

import { FormEvent, useState } from "react";

type QueueItem = { id: string; claimNumber: string; valueExact: string; status: string; claimType: string };

/**
 * Full editorial CRUD (Limits, specs, claims, evidence, reviews, audit log)
 * against /api/editorial. That route predates real user auth and still
 * gates on EDITORIAL_ADMIN_TOKEN rather than the session — /console itself
 * is now behind requireRole("RESEARCHER"), but this panel's own writes stay
 * token-gated until /api/editorial is migrated to read the session directly.
 */
export function EditorialWorkspace() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [audit, setAudit] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Enter the editorial admin token to connect.");

  async function loadAudit() { const response = await fetch("/api/editorial?audit=1", { headers: { "x-editorial-token": token } }); const data = await response.json(); setAudit(data.items ?? []); }
  async function refresh(value = query) { const response = await fetch(`/api/editorial?q=${encodeURIComponent(value)}`, { headers: { "x-editorial-token": token } }); const data = await response.json(); setItems(data.items ?? []); setMessage(data.error ?? `${(data.items ?? []).length} queue items loaded.`); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage("Saving…"); const body = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch("/api/editorial", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, token, action: "create-limit", direction: "MAXIMIZE" }) }); const data = await response.json(); setMessage(response.ok ? `Created ${data.registryNumber}.` : data.error ?? "Could not save."); if (response.ok) event.currentTarget.reset(); }
  async function submitAction(event: FormEvent<HTMLFormElement>, action: string) { event.preventDefault(); setMessage("Saving…"); const values = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch("/api/editorial", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, action, token, conflictDisclosed: true }) }); const data = await response.json(); setMessage(response.ok ? "Saved to the editorial database." : data.error ?? "Could not save."); if (response.ok) event.currentTarget.reset(); }
  async function update(id: string, status: string) { const response = await fetch("/api/editorial", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "update-claim", claimId: id, status, token }) }); setMessage(response.ok ? "Claim updated." : "Could not update claim."); void refresh(); }

  return <>
    <section className="console-intro">
      <p className="section-kicker">Editorial database access</p>
      <h2>Limits, specifications, claims &amp; reviews</h2>
      <p>Intake sources, create scoped records, and move Claims through review. Every operation is server-authorized.</p>
      <label className="token-field">Admin token<input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="EDITORIAL_ADMIN_TOKEN" autoComplete="current-password" /><button type="button" className="primary-button" onClick={() => void refresh("")} disabled={!token}>Connect to queue</button></label>
    </section>
    <div className="console-panels">
      <section className="editor-panel">
        <h2>Create a Limit</h2>
        <form onSubmit={submit}><label>Registry number<input name="registryNumber" placeholder="LR-000200" required /></label><label>Slug<input name="slug" placeholder="new-limit" required /></label><label>Title<input name="title" required /></label><label>Category<input name="category" placeholder="Graph theory" required /></label><label>Summary<textarea name="summary" minLength={10} required /></label><button className="primary-button" type="submit" disabled={!token}>Create draft limit</button></form>
        <hr />
        <h2>Source intake (manual)</h2>
        <form onSubmit={e => void submitAction(e, "create-evidence")}><label>Source label<input name="label" required /></label><label>Source URL<input name="url" type="url" /></label><label>Location<input name="location" placeholder="Theorem 1, page 4" /></label><label>Type<select name="type" defaultValue="PAPER"><option>PAPER</option><option>FORMAL_PROOF</option><option>SOURCE_CODE</option><option>DATASET</option><option>EXHAUSTIVE_COMPUTATION</option><option>REPRODUCTION</option><option>OTHER</option></select></label><button className="secondary-button" type="submit" disabled={!token}>Attach evidence</button></form>
        <hr />
        <h2>Claim draft</h2>
        <form onSubmit={e => void submitAction(e, "create-claim")}><label>Specification UUID<input name="specificationVersionId" required /></label><label>Claim number<input name="claimNumber" placeholder="CLM-000500" required /></label><label>Value<input name="valueExact" placeholder="3/2 or O(n)" required /></label><label>Relation<select name="relation" defaultValue="<="><option>&lt;</option><option>&lt;=</option><option>=</option><option>&gt;=</option><option>&gt;</option></select></label><label>Type<select name="claimType" defaultValue="UPPER_BOUND"><option>UPPER_BOUND</option><option>LOWER_BOUND</option><option>EXACT_VALUE</option><option>CONSTRUCTION</option><option>ASYMPTOTIC_BOUND</option><option>COMPUTATIONAL_BOUND</option></select></label><label>Method summary<textarea name="methodSummary" /></label><input type="hidden" name="epistemicStatus" value="LITERATURE_ASSERTED" /><button className="secondary-button" type="submit" disabled={!token}>Save claim draft</button></form>
        <hr />
        <h2>Specification version</h2>
        <form onSubmit={e => void submitAction(e, "create-spec")}><label>Limit UUID<input name="limitId" required /></label><label>Formal statement<textarea name="formalStatement" minLength={10} required /></label><label>Constraints<input name="constraints" placeholder="domain=finite" required /></label><button className="secondary-button" type="submit" disabled={!token}>Create specification</button></form>
        <hr />
        <h2>Review decision</h2>
        <form onSubmit={e => void submitAction(e, "record-review")}><label>Claim UUID<input name="claimId" required /></label><label>Reviewer user ID<input name="reviewerUserId" placeholder="from /admin" required /></label><label>Decision<select name="decision"><option>ACCEPTED</option><option>REJECTED</option><option>NEEDS_REVISION</option></select></label><label>Rationale<textarea name="rationale" minLength={10} required /></label><button className="secondary-button" type="submit" disabled={!token}>Record review</button></form>
      </section>
      <section className="editor-panel">
        <div className="queue-head"><div><h2>Review queue</h2><p>Draft and under-review Claims.</p></div><input aria-label="Filter review queue" value={query} onChange={e => { setQuery(e.target.value); void refresh(e.target.value); }} placeholder="Filter claims" /></div>
        {items.length ? items.map(item => <article className="editor-claim" key={item.id}><div><strong>{item.claimNumber}</strong><span>{item.claimType} · {item.valueExact}</span></div><select aria-label={`Status for ${item.claimNumber}`} defaultValue={item.status} onChange={e => void update(item.id, e.target.value)}><option>DRAFT</option><option>UNDER_REVIEW</option><option>ACCEPTED</option><option>REJECTED</option><option>DISPUTED</option><option>INVALIDATED</option></select></article>) : <div className="empty-state"><strong>No claims in queue</strong><span>Authenticate to load editorial work.</span></div>}
      </section>
      <section className="editor-panel audit-panel">
        <div className="queue-head"><div><h2>Audit log</h2><p>Recent editorial actions.</p></div><button className="secondary-button" type="button" onClick={() => void loadAudit()} disabled={!token}>Load log</button></div>
        {audit.length ? audit.map((entry, index) => <pre key={index}>{JSON.stringify(entry, null, 2)}</pre>) : <div className="empty-state"><strong>No audit entries loaded</strong><span>Load the protected audit log when needed.</span></div>}
      </section>
    </div>
    <p role="status" className="console-message">{message}</p>
  </>;
}
