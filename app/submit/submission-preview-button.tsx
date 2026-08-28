"use client";

import { useState } from "react";

export function SubmissionPreviewButton() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({ limit: "", type: "", bound: "", value: "", evidence: "" });
  function preview(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form) return;
    const data = new FormData(form);
    setSummary({ limit: String(data.get("limitId") || "Not selected"), type: String(data.get("submissionType") || "Not selected"), bound: String(data.get("proposedRelation") || "Not selected"), value: String(data.get("proposedValueExact") || "Not provided"), evidence: data.get("proofFile") instanceof File && (data.get("proofFile") as File).size > 0 ? (data.get("proofFile") as File).name : String(data.get("evidenceUrl") || "No evidence provided") });
    setOpen(true);
  }
  return <><button type="button" className="submission-preview-button" onClick={preview}>{open ? "Refresh preview" : "Preview submission"}</button>{open ? <aside className="submission-preview" aria-live="polite"><strong>Check your challenge before sending</strong><div>Limit: {summary.limit}</div><div>Type: {summary.type}</div><div>Bound: {summary.bound} {summary.value}</div><div>Evidence: {summary.evidence}</div></aside> : null}</>;
}
