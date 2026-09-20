"use client";

import { useState } from "react";
import { issueKey, publishCurrentSnapshot, revokeKey } from "./actions";

export function IssueKeyForm() {
  const [pending, setPending] = useState(false);
  const [plaintext, setPlaintext] = useState<string>();
  const [error, setError] = useState<string>();
  return <>
    <form className="admin-form" onSubmit={async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      setPending(true); setError(undefined); setPlaintext(undefined);
      try {
        const result = await issueKey(new FormData(form));
        if (result.error) setError(result.error);
        else { setPlaintext(result.plaintext); form.reset(); }
      } catch { setError("The request failed. Refresh the list before retrying; revoke any key whose secret was not received."); }
      finally { setPending(false); }
    }}>
      <label>Organisation<input name="organizationName" required maxLength={200} /></label>
      <label>Contact email<input name="contactEmail" type="email" required maxLength={254} /></label>
      <label>Invoice or deal note<textarea name="note" maxLength={2000} /></label>
      <button className="admin-submit" disabled={pending || Boolean(plaintext)}>{pending ? "Issuing…" : "Issue pilot key"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
    {plaintext && <div className="admin-panel api-key-secret" role="status">
      <strong>Copy this key now. It will not be shown again.</strong>
      <p>Send it securely to the customer. Only a hash is stored. If lost, revoke the key and issue another.</p>
      <code>{plaintext}</code>
      <button className="admin-submit" onClick={() => setPlaintext(undefined)}>I saved the key — hide it</button>
    </div>}
  </>;
}

export function RevokeKeyButton({ id, prefix }: { id: string; prefix: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return <><button disabled={pending} onClick={async () => {
    if (!confirm(`Revoke ${prefix}…? This permanently disables its snapshot access.`)) return;
    setPending(true);
    try { const result = await revokeKey(id); setMessage(result.error ?? result.message ?? ""); }
    catch { setMessage("Revocation could not be confirmed. Refresh and retry."); }
    finally { setPending(false); }
  }}>{pending ? "Revoking…" : "Revoke"}</button>{message && <p role="status">{message}</p>}</>;
}

export function PublishSnapshotButton({ configured }: { configured: boolean }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return <><button className="admin-submit" disabled={pending || !configured} onClick={async () => {
    setPending(true); setMessage("");
    try { const result = await publishCurrentSnapshot(); setMessage(result.error ?? result.message ?? ""); }
    catch { setMessage("Publication could not be confirmed. Refresh to check the current revision before retrying."); }
    finally { setPending(false); }
  }}>{pending ? "Building and publishing…" : "Publish current registry snapshot"}</button><p role="status">{message}</p></>;
}
