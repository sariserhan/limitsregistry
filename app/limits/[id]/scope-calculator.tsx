"use client";

import { useState } from "react";

export function ScopeCalculator({ constraints }: { constraints: Record<string, string> }) {
  const entries = Object.entries(constraints);
  const [values, setValues] = useState<Record<string, string>>(constraints);
  const changed = entries.filter(([key, value]) => values[key] !== value).length;
  return <div className="scope-calculator"><div><span className="problem-label">Scope audit</span><h3>Does your result fit this record?</h3><p>Change a parameter to stress-test whether a proposed result is still inside the published specification. This is an audit aid, not a proof checker.</p></div>{entries.length ? <div className="scope-controls">{entries.map(([key]) => <label key={key}>{key.replaceAll("_", " ")}<input value={values[key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div> : <p className="scope-empty">This record has no editable parameters. Read the formal question and assumptions before challenging it.</p>}<div className={"scope-result " + (changed ? "changed" : "match")}><strong>{changed ? "Scope changed — re-check the Claim" : "Scope matches the published specification"}</strong><span>{changed ? changed + " parameter" + (changed === 1 ? "" : "s") + " changed" : "No parameters changed"}</span></div></div>;
}
