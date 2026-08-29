import { getRegistryQualityReport } from "../../../src/db/repository.registry-tools";

export default async function AdminQualityPage() {
  const report = await getRegistryQualityReport();
  const metrics = [
    ["Public records", report.public_total, "ok"],
    ["Missing subcategory", report.missing_subcategory, report.missing_subcategory ? "warn" : "ok"],
    ["Missing unit", report.missing_unit, report.missing_unit ? "warn" : "ok"],
    ["Missing summary", report.missing_summary, report.missing_summary ? "warn" : "ok"],
    ["Without specification", report.without_specification, report.without_specification ? "warn" : "ok"],
    ["Without accepted Claim", report.without_accepted_claim, report.without_accepted_claim ? "warn" : "ok"],
    ["Without evidence", report.without_evidence, report.without_evidence ? "warn" : "ok"],
    ["Duplicate title groups", report.duplicate_title_groups, report.duplicate_title_groups ? "warn" : "ok"],
  ] as const;
  return <section className="admin-section"><h2>Data quality</h2><p>Coverage checks for public records. Counts are calculated directly from the database.</p><div className="admin-stat-grid">{metrics.map(([label, value, tone]) => <article className="admin-stat-card" key={label}><span>{label}</span><strong className={tone}>{Number(value).toLocaleString()}</strong></article>)}</div><div className="admin-panel"><strong>Quality policy</strong><p>Missing metadata is a review queue signal, not an automatic rejection. A record can remain public while editors resolve a missing unit, source, or specification.</p></div></section>;
}
