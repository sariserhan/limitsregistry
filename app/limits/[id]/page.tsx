import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { getCanonicalRecord } from "../../../src/domain/canonical";
import { getPublishedLimit } from "../../../src/domain/published";
import { getLimitResearchData, getPublishedLimitWithFrontier, getSpecificationVersionHistory } from "../../../src/db/repository";
import { listPublicBounties, listPublishedVerificationHistory } from "../../../src/db/repository.research";
import { listBreakthroughEventsForLimit } from "../../../src/db/repository.breakthroughs";
import { listPublicSubmissionHistory } from "../../../src/db/repository.submissions";
import CopyCitationButton from "./CopyCitationButton";
import { ScopeCalculator } from "./scope-calculator";
import { EmbedSnippet } from "./embed-snippet";
import { followClaimAction } from "./claim-follow-actions";
import { deriveFrontierPresentation, type FrontierPresentation } from "../../../src/domain/frontier-presentation";
import { buildRecordJsonLd, jsonLdScript } from "../../../src/domain/structured-data";

type PageProps = { params: Promise<{ id: string }> };

const BREAKTHROUGH_LABEL: Record<string, string> = { STRONGER_BOUND: "Stronger bound accepted", FRONTIER_CLOSED: "Frontier closed" };

const launchClaims = [
  ["CLM-000184", "L ≥ 5", "CONSTRUCTION / LOWER BOUND", "de Grey, 2018", "SOURCE_CONFIRMED"],
  ["CLM-000208", "L ≤ 7", "UPPER BOUND", "Exoo & Ismailescu, 2019", "PROVEN"],
  ["CLM-000119", "L ≥ 4", "LOWER BOUND", "Erdős, Ko, and Rado, 1950", "PROVEN"],
];

function exactDisplay(value: { kind: "integer"; value: bigint } | { kind: "rational"; numerator: bigint; denominator: bigint } | { kind: "text"; value: string } | null | undefined) { if (!value) return "?"; if (value.kind === "integer") return value.value.toString(); if (value.kind === "rational") return `${value.numerator}/${value.denominator}`; return value.value; }

function CanonicalFrontier({ presentation, isMinimization, isAsymptotic, status, lower, upper, gap }: { presentation: FrontierPresentation; isMinimization: boolean; isAsymptotic: boolean; status: string; lower: string; upper: string; gap: string }) {
  if (presentation.mode === "SINGLE_VALUE") return <div className="frontier-single"><span>{presentation.label}</span><strong>{exactDisplay(presentation.value)}</strong><p>{presentation.note}</p></div>;
  if (presentation.mode === "ONE_SIDED") return <div className={"frontier " + (isAsymptotic ? "asymptotic" : "integer")}><div className="frontier-labels"><span>KNOWN LOWER BOUND</span><span>KNOWN UPPER BOUND</span></div><div className="frontier-values"><strong>{lower === "?" ? "Unknown" : lower}</strong><div className="frontier-line"><i /><span>OPEN FRONTIER</span><i /></div><strong>{upper === "?" ? "Unknown" : upper}</strong></div><div className="frontier-foot"><span>Lower bound</span><span>Gap: Unknown</span><span>Upper bound</span></div></div>;
  return <div className={"frontier " + (isAsymptotic ? "asymptotic" : "integer")}><div className="frontier-labels"><span>{isMinimization ? "PROVEN LOWER BOUND" : "BEST KNOWN LOWER BOUND"}</span><span>{isMinimization ? "BEST KNOWN UPPER BOUND" : "PROVEN UPPER BOUND"}</span></div><div className="frontier-values"><strong>{lower}</strong><div className="frontier-line"><i /><span>{status === "PROVEN" ? "CLOSED FRONTIER" : "UNKNOWN GAP"}</span><i /></div><strong>{upper}</strong></div><div className="frontier-foot"><span>{isMinimization ? "Proven lower bound" : "Best known lower bound"}</span><span>Gap: {gap}</span><span>{isMinimization ? "Best known upper bound" : "Proven upper bound"}</span></div></div>;
}

// Runs separately from the page component (Next.js convention — see opengraph-image.tsx too),
// so this re-fetches rather than sharing state with LimitPage below; both calls are cheap reads
// through the same 60s data cache.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const launch = getPublishedLimit(id);
  const database = await getPublishedLimitWithFrontier(id).catch(() => null);
  const fallback = launch ?? getCanonicalRecord(id);
  if (!database && !fallback) return { title: "Record not found — Limits Registry" };
  const record = database
    ? { id: database.limit.registryNumber, title: database.limit.title, summary: database.limit.summary }
    : { id: fallback!.id, title: fallback!.title, summary: fallback!.summary };
  const title = `${record.title} (${record.id}) — Limits Registry`;
  const path = `/limits/${record.id}`;
  return {
    title,
    description: record.summary,
    alternates: { canonical: path },
    openGraph: { title, description: record.summary, url: path, type: "article" },
    twitter: { card: "summary_large_image", title, description: record.summary },
  };
}

export default async function LimitPage({ params }: PageProps) {
  const { id } = await params;
  const launch = getPublishedLimit(id);
  const database = await getPublishedLimitWithFrontier(id).catch(() => null);
  const fallback = launch ?? getCanonicalRecord(id);
  // Neither a curated launch record, a canonical demo record, nor a real published (OPEN/PROVEN)
  // database row matched — this id genuinely doesn't correspond to any public record.
  // getCanonicalRecord used to silently fall back to LR-000072's data for ANY unmatched id, so a
  // nonexistent or still-DRAFT url would render as if it were a real published "Chromatic number
  // of the plane" record — a direct violation of "no draft or nonexistent record may appear as if
  // published."
  if (!database && !fallback) notFound();
  const record = database ? { id: database.limit.registryNumber, title: database.limit.title, summary: database.limit.summary, category: [database.limit.category, database.limit.subcategory].filter(Boolean).join(" / ").toUpperCase(), achievable: exactDisplay(database.frontier?.lowerBound), bound: exactDisplay(database.frontier?.upperBound), gap: database.frontier?.gap ?? "Unknown", mode: "integer" as const } : fallback!;
  const [research, verificationHistory, bounties, breakthroughEvents, specificationHistory, challengeHistory] = database ? await Promise.all([getLimitResearchData(database.limit.id).catch(() => ({ specification: null, claims: [], evidence: [] })), listPublishedVerificationHistory(database.limit.id).catch(() => []), listPublicBounties(database.limit.id).catch(() => []), listBreakthroughEventsForLimit(database.limit.id).catch(() => []), getSpecificationVersionHistory(database.limit.id).catch(() => []), listPublicSubmissionHistory(database.limit.id).catch(() => [])]) : [null, [], [], [], [], []];
  const citation = `Limits Registry. ${record.id}. ${record.title}. ${new Date().getUTCFullYear()}.`;
  const isMinimization = (database?.limit.direction ?? launch?.direction ?? "MINIMIZE") === "MINIMIZE";
  const displayStatus = database?.limit.status ?? launch?.status ?? "OPEN";
  // Only ACCEPTED claims may ever reach this public page — getLimitResearchData returns every
  // claim tied to the current specification version regardless of status, since it's also used
  // by the authenticated research console where drafts are exactly what needs reviewing.
  const acceptedClaims = research?.claims.filter((claim) => claim.status === "ACCEPTED") ?? [];
  const frontierPresentation = database?.frontier ? deriveFrontierPresentation(research?.specification?.recordKind, acceptedClaims, database.frontier) : { mode: "INTERVAL" as const };
  const displayedClaims = acceptedClaims.length ? acceptedClaims.map((claim) => ({ id: claim.id, relation: `${claim.relation} ${exactDisplay(claim.value)}`, kind: claim.claimType.replaceAll("_", " "), author: claim.methodSummary ?? claim.source, status: claim.epistemicStatus.replaceAll("_", " "), year: claim.year, sources: claim.evidenceIds.flatMap((evidenceId) => { const item = research?.evidence.find((row) => row.id === evidenceId); return item ? [item] : []; }) })) : database ? [] : launchClaims.map(([claimId, relation, kind, author, status], index) => ({ id: claimId, relation, kind, author, status: status.replaceAll("_", " "), year: index === 0 ? 2018 : index === 1 ? 2019 : 1950, sources: [] }));
  const isAsymptotic = database ? (research?.specification?.asymptotic ?? false) : record.gap === "Asymptotic";
  // "Read full specification" used to just jump to #claims on the same page — no actual source to
  // read. Point it at the record's real citation when one exists (research.evidence isn't reachable
  // without at least one claim, so an OPEN record with no accepted claims yet still falls back).
  const specificationSourceUrl = research?.evidence[0]?.sourceUrl;
  const primarySources = [...new Map((research?.evidence ?? []).filter((item) => item.sourceUrl).map((item) => [item.sourceUrl!, item])).values()];
  const formalQuestion = research?.specification?.formalStatement ?? record.summary;
  const specificationConstraints = Object.entries(research?.specification?.constraints ?? {});
  const jsonLd = buildRecordJsonLd({ registryNumber: record.id, title: record.title, summary: record.summary, category: record.category, metricName: database?.limit.metricName, unit: database?.limit.unit, publishedAt: database?.limit.publishedAt, sourceUrls: primarySources.map((source) => source.sourceUrl!) });
  const scopeConstraintValues = Object.fromEntries(specificationConstraints.map(([key, value]) => [key, String(value)]));
  const challengeHref = database ? `/submit?limitId=${encodeURIComponent(database.limit.id)}` : "/submit";
  return <main className="canonical-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
    <PublicHeader />
    <section className="canonical-intro"><div className="canonical-category">{record.category}</div><div className="canonical-id-row"><span className="canonical-id">{record.id}</span><span className="canonical-status">{displayStatus.replaceAll("_", " ")} LIMIT</span></div><h1>{record.title}</h1><p>{record.summary}</p><div className="intro-foot"><span>Specification version {research?.specification?.version ?? 2}</span><span>{database ? `Published ${database.limit.publishedAt ? new Date(database.limit.publishedAt).toISOString().slice(0, 10) : undefined ?? "—"}` : "Last updated May 12, 2025"}</span><span>{research ? `${research.evidence.length} evidence records` : "19 cited papers"}</span></div></section>
    <section className="problem-section" aria-labelledby="about-problem"><div className="section-title"><span>01</span><h2 id="about-problem">About this problem</h2><p>The question, scope, and sources behind this Registry record.</p></div><div className="problem-content"><div className="problem-description"><span className="problem-label">Formal question</span><p>{formalQuestion}</p></div><div className="problem-metadata"><div><span className="problem-label">Scope &amp; constraints</span>{specificationConstraints.length ? <dl>{specificationConstraints.map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{value}</dd></div>)}</dl> : <p>Current published specification applies.</p>}</div><div><span className="problem-label">Primary sources</span>{primarySources.length ? <ul>{primarySources.map((source) => <li key={source.id}><a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.label} <span aria-hidden="true">↗</span></a>{source.location ? <small>{source.location}</small> : null}</li>)}</ul> : <p>No external source link is recorded for this legacy fixture.</p>}</div></div>{primarySources.some((source) => source.abstract) ? <div className="problem-abstracts">{primarySources.filter((source) => source.abstract).map((source) => <div key={source.id} className="problem-abstract"><span className="problem-label">Abstract</span><p>{source.abstract}</p><small>{source.label}</small></div>)}</div> : null}<ScopeCalculator constraints={scopeConstraintValues} /></div></section>
    <section className="knowledge-section"><div className="section-title"><span>02</span><h2>What we know</h2><p>Current frontiers derived from accepted Claims.</p></div><CanonicalFrontier presentation={frontierPresentation} isMinimization={isMinimization} isAsymptotic={isAsymptotic} status={displayStatus} lower={record.achievable} upper={record.bound} gap={record.gap} /></section>
    <section className="challenge-section" aria-labelledby="challenge-title"><div className="challenge-copy"><p className="section-kicker">The frontier is not sacred</p><h2 id="challenge-title">Think this record is wrong? Good.</h2><p>Most progress starts with a disagreement that survives contact with evidence. If you can push the known lower bound up or pull the upper bound down, show us the work.</p><div className="challenge-directions"><div><strong>Push the floor up</strong><span>Propose <code>≥</code> when you have shown that at least this value is achievable.</span></div><div><strong>Pull the ceiling down</strong><span>Propose <code>≤</code> when you have shown that anything above this value is impossible.</span></div></div><p className="challenge-standard">No vibes. State the value, define the scope, and link the paper, proof, code, or reproduction that lets another person check it. Editors review every challenge before the public record changes.</p><Link className="challenge-link" href={challengeHref}>Challenge this record <span aria-hidden="true">↗</span></Link></div></section>
    <section className="canonical-columns"><div className="canonical-main"><div className="section-title" id="claims"><span>03</span><h2>Claims</h2><p>Assertions tied to evidence, attribution, and review.</p></div><div className="claims-table">{displayedClaims.length ? displayedClaims.map((claim) => <article className="public-claim" key={claim.id}><div className="claim-year">{claim.year}</div><div className="public-claim-copy"><span className="public-claim-id">{claim.id}</span><strong>{claim.relation}</strong><span>{claim.kind}</span><small>{claim.author}</small>{claim.sources.length ? <small className="public-claim-sources">Evidence quality: {claim.sources.map((item) => item.type.replaceAll("_", " ")).join(", ")} · Source: {claim.sources.map((item, index) => <span key={item.id}>{index > 0 ? ", " : ""}{item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.label} ↗</a> : item.label}</span>)}</small> : database ? null : <small>Evidence: original paper</small>}</div><span className={`public-status ${claim.status.toLowerCase().replaceAll(" ", "_")}`}>{claim.status}</span><form className="claim-follow-form" action={followClaimAction}><input type="hidden" name="claimNumber" value={claim.id} /><input type="hidden" name="registryNumber" value={record.id} /><button type="submit">Follow Claim</button></form></article>) : <p>No accepted Claims are recorded for this Limit yet.</p>}</div><div className="section-title lower-title" id="timeline"><span>04</span><h2>Timeline</h2><p>The frontier as it changed over time.</p></div><div className="frontier-explanation" role="note"><strong>How this frontier is derived</strong><p>Only accepted Claims matching the current specification contribute to the displayed bounds. Strict inequalities remain open; contradictory Claims require editorial review.</p></div><div className="history">{breakthroughEvents.length ? breakthroughEvents.map(({ event, claimNumber, relation, valueExact }) => <div key={event.id}><span>{event.occurredAt.toISOString().slice(0, 10)}</span><strong>{BREAKTHROUGH_LABEL[event.eventType] ?? event.eventType}</strong><small>{claimNumber ? `${claimNumber} · ${relation} ${valueExact}` : "Accepted Claim"}</small></div>) : <div><span>—</span><strong>No breakthrough events recorded yet</strong><small>Events appear here when an accepted Claim tightens a bound or closes the frontier.</small></div>}</div></div><aside className="canonical-aside"><div className="aside-block" id="specification"><span className="aside-label">Specification</span><h3>What question is being asked?</h3><p className="spec-constraints">Constraints: {research?.specification ? Object.entries(research.specification.constraints).map(([key, value]) => `${key}=${value}`).join(" · ") : "Current published scope"}</p>{specificationSourceUrl ? <a href={specificationSourceUrl} target="_blank" rel="noreferrer">Read full specification <span>↗</span></a> : <Link href="#claims">Read full specification <span>↗</span></Link>}</div><div className="aside-block" id="history"><span className="aside-label">Corrections & disputes</span><h3>Record history</h3><p>{challengeHistory.length ? `${challengeHistory.length} community challenge${challengeHistory.length === 1 ? "" : "s"} recorded for this Limit.` : "No community challenges are recorded for this published version yet."}</p>{challengeHistory.length ? <div className="challenge-history">{challengeHistory.slice(0, 5).map(({ submission, submitter }) => <div key={submission.id}><strong>{submission.proposedRelation} {submission.proposedValueExact}</strong><span>{submission.status.replaceAll("_", " ")}</span><small>{submitter.name} · {new Date(submission.createdAt).toISOString().slice(0, 10)}</small></div>)}</div> : null}<Link href="#timeline">View timeline <span>↗</span></Link></div><div className="aside-block" id="evidence"><span className="aside-label">Editorial status</span><h3>Evidence-backed record</h3><p>{database ? `${acceptedClaims.length} accepted ${acceptedClaims.length === 1 ? "Claim" : "Claims"}, with ${research?.evidence.length ?? 0} linked evidence records.` : "2 independent reviews completed. Current frontier accepted May 12, 2025."}</p><div className="review-meter"><span /><span /></div><small>Human-reviewed · No AI-only claims</small>{database && specificationHistory.length ? <div className="version-history">{specificationHistory.map((version) => <div key={version.id} className="version-row"><span>V{version.version}</span><span>{version.createdAt.toISOString().slice(0, 10)}</span></div>)}</div> : null}{database ? <p className="permanent-id">Permanent ID <code>limitsregistry.com/limits/{record.id}</code></p> : null}</div><div className="aside-block" id="bounties"><span className="aside-label">Verified prizes &amp; bounties</span><h3>Active verified incentives</h3>{bounties.length ? bounties.map(({ bounty }) => <div className="canonical-bounty" key={bounty.id}><strong>{bounty.title}</strong><span>{bounty.amount && bounty.currency ? [bounty.amount, bounty.currency].join(" ") : "Amount not specified"}</span><small>{bounty.sponsor}{bounty.expiresAt ? <> · Expires {new Date(bounty.expiresAt).toLocaleDateString()}</> : null}</small><a href={bounty.sourceUrl} target="_blank" rel="noreferrer">Official terms ↗</a></div>) : <p>No active verified bounties are linked to this Limit.</p>}<Link href="/bounties">View verified bounty tracker <span>↗</span></Link></div><div className="aside-block" id="reproducibility"><span className="aside-label">Reproducibility</span><h3>Machine-checked history</h3>{verificationHistory.length ? verificationHistory.map(({ artifact, execution, claimNumber }) => <div className="public-reproduction" key={execution.id}><strong>{claimNumber} · {artifact.verifier}</strong><span>MACHINE CHECKED · {execution.toolVersion}</span><small>Commit {artifact.commitHash.slice(0, 12)} · Output SHA-256 {execution.outputDigest.slice(0, 16)}…</small><a href={artifact.repositoryUrl} target="_blank" rel="noreferrer">Verification artifact ↗</a></div>) : <p>No accepted machine-checked reproductions are recorded for this Limit.</p>}</div><EmbedSnippet registryNumber={record.id} /><div className="aside-block citation"><span className="aside-label">Cite this Limit</span><code>{citation}</code><CopyCitationButton citation={citation} /></div></aside></section>
    <SiteFooter />
  </main>;
}
