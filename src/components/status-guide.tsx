const limitStatuses = [
  ["DRAFT", "Internal working record. It is not part of the public registry frontier."],
  ["OPEN", "Public and source-backed, but the frontier is not fully closed. It may have bounds, approximations, or measurements without a settled exact optimum."],
  ["PROVEN", "The precise recorded statement is formally established for its specification, typically by matching bounds, an exact theorem, or an impossibility result."],
  ["DISPUTED", "A published record or Claim has a substantive unresolved challenge. It remains visible, but readers should not treat it as settled."],
  ["RETIRED", "No longer an active frontier in the Registry, usually because it was superseded, scoped out, or replaced. Its history remains available."],
] as const;

const claimStatuses = [
  ["DRAFT", "Prepared but not yet submitted for editorial review."],
  ["UNDER_REVIEW", "Submitted and currently being checked against its specification and evidence."],
  ["ACCEPTED", "Approved Claim that may contribute to a published frontier."],
  ["REJECTED", "Reviewed and not accepted in its current form."],
  ["DISPUTED", "A published Claim has an unresolved substantive challenge."],
  ["INVALIDATED", "Later evidence or review found that the Claim does not hold under its recorded scope."],
] as const;

function StatusRows({ items }: { items: readonly (readonly [string, string])[] }) {
  return <dl className="status-guide-list">{items.map(([status, description]) => <div key={status}><dt><span className={"status-guide-badge status-guide-" + status.toLowerCase()}>{status.replaceAll("_", " ")}</span></dt><dd>{description}</dd></div>)}</dl>;
}

export function StatusGuide() {
  return <section className="status-guide" aria-labelledby="status-guide-title">
    <h2 id="status-guide-title">Status meanings</h2>
    <p>Statuses describe the Registry’s editorial state, not the importance of a result or the strength of a paper’s reputation.</p>
    <h3>Limit status</h3>
    <StatusRows items={limitStatuses} />
    <h3>Claim review status</h3>
    <StatusRows items={claimStatuses} />
    <p className="info-note">A record can be <b>OPEN</b> even when individual Claims are proven: a one-sided bound or a measurement does not by itself close the full frontier.</p>
  </section>;
}
