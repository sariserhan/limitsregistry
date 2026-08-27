import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandIcon } from "../../../src/components/brand-icon";
import { getCanonicalRecord } from "../../../src/domain/canonical";
import { getPublishedLimit } from "../../../src/domain/published";
import { getPublishedDomainLimit, getLimitResearchData, getPublishedLimit as getRawPublishedLimit } from "../../../src/db/repository";
import { listPublicBounties, listPublishedVerificationHistory } from "../../../src/db/repository.research";
import { listBreakthroughEventsForLimit } from "../../../src/db/repository.breakthroughs";
import { formatExact } from "../../../src/domain/published";
import { deriveFrontier } from "../../../src/domain/frontier";
import CopyCitationButton from "./CopyCitationButton";

type PageProps = { params: Promise<{ id: string }> };

const BREAKTHROUGH_LABEL: Record<string, string> = { STRONGER_BOUND: "Stronger bound accepted", FRONTIER_CLOSED: "Frontier closed" };

export default async function LimitPage({ params }: PageProps) {
  const { id } = await params;
  const published = getPublishedLimit(id);
  const fallback = published ?? getCanonicalRecord(id);
  const databaseLimit = await getPublishedDomainLimit(id).catch(() => null);
  // Neither a curated launch record, a canonical demo record, nor a real published (OPEN/PROVEN)
  // database row matched — this id genuinely doesn't correspond to any public record. Previously
  // getCanonicalRecord silently fell back to LR-000072's data for ANY unmatched id, so every
  // nonexistent or still-DRAFT url rendered as if it were a real published "Chromatic number of
  // the plane" record — a direct violation of "no draft or nonexistent record may appear as if
  // published."
  if (!fallback && !databaseLimit) notFound();
  const record = databaseLimit ? { ...fallback, id: databaseLimit.id, title: databaseLimit.title, summary: databaseLimit.summary, category: databaseLimit.category.toUpperCase() } : fallback!;
  // getPublishedDomainLimit's id is actually the registry number (serializeLimit remaps it) — the
  // real uuid every other query below needs has to come from the raw row instead. This must be
  // fetched BEFORE the rest (not run alongside them in the same Promise.all) since they all
  // depend on its result — calling them with the registry-number string instead of the real uuid
  // made every one of them silently fail its uuid-column comparison and fall back to its empty
  // default, so specification/claims/verification/bounties were always empty for every real
  // published Limit regardless of what data actually existed.
  const rawLimit = databaseLimit ? await getRawPublishedLimit(id).catch(() => null) : null;
  const [research, verificationHistory, bounties] = rawLimit ? await Promise.all([getLimitResearchData(rawLimit.id).catch(() => ({ specification: null, claims: [], evidence: [] })), listPublishedVerificationHistory(rawLimit.id).catch(() => []), listPublicBounties(rawLimit.id).catch(() => [])]) : [null, [], []];
  const breakthroughEvents = rawLimit ? await listBreakthroughEventsForLimit(rawLimit.id).catch(() => []) : [];
  // Only ACCEPTED claims may ever reach this public page — getLimitResearchData returns every
  // claim tied to the current specification version regardless of status, since it's also used
  // by the authenticated research console where drafts are exactly what needs reviewing.
  const claims = databaseLimit ? (research?.claims ?? []).filter((c) => c.status === "ACCEPTED") : published?.claimsData ?? [];
  // A real database-backed Limit's frontier must come from its own real accepted Claims, never
  // from the static canonical/curated demo records — those only apply to the ~8 launch-content
  // ids that predate any real editorial data and have no databaseLimit at all.
  const frontier = databaseLimit && research?.specification ? deriveFrontier(databaseLimit.direction, research.specification, claims) : null;
  const citation = `Limits Registry. ${record.id}. ${record.title}. ${new Date().getUTCFullYear()}.`;
  const isMinimization = (databaseLimit?.direction ?? published?.direction ?? "MINIMIZE") === "MINIMIZE";
  const displayStatus = databaseLimit?.status ?? published?.frontier.status ?? "OPEN";
  const displayAchievable = frontier ? formatExact(frontier.lowerBound) : fallback?.achievable ?? "?";
  const displayBound = frontier ? formatExact(frontier.upperBound) : fallback?.bound ?? "?";
  const displayGap = frontier ? frontier.gap : fallback?.gap ?? "Unknown";
  const isAsymptotic = frontier ? (research?.specification?.asymptotic ?? false) : fallback?.gap === "Asymptotic";
  const specVersion = databaseLimit ? research?.specification?.version ?? 1 : 2;
  // getRawPublishedLimit is unstable_cache-wrapped, which round-trips its return value through
  // JSON on a cache hit — updatedAt arrives as an ISO string at runtime despite the Drizzle-
  // inferred type claiming Date, so it must be re-coerced before calling Date methods on it.
  const lastUpdated = databaseLimit && rawLimit ? new Date(rawLimit.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "May 12, 2025";
  const evidenceCount = databaseLimit ? research?.evidence?.length ?? 0 : 19;
  return <main className="canonical-page">
    <header className="canonical-header"><Link className="brand" href="/"><BrandIcon className="brand-mark" /><span>Limits Registry</span></Link><nav><Link href="/">Browse</Link><Link href="#claims">Claims</Link><Link href="#specification">Specification</Link><Link href="#evidence">Evidence</Link><Link href="/watchlists">Watch</Link></nav><span className="header-tag">PUBLIC RECORD</span></header>
    <section className="canonical-intro"><div className="canonical-category">{record.category}</div><div className="canonical-id-row"><span className="canonical-id">{record.id}</span><span className="canonical-status">{displayStatus === "PROVEN" ? "PROVEN LIMIT" : "OPEN LIMIT"}</span></div><h1>{record.title}</h1><p>{record.summary}</p><div className="intro-foot"><span>Specification version {specVersion}</span><span>Last updated {lastUpdated}</span><span>{evidenceCount} {evidenceCount === 1 ? "evidence record" : "evidence records"}</span></div></section>
    <section className="knowledge-section"><div className="section-title"><span>01</span><h2>What we know</h2><p>Current frontiers derived from accepted Claims.</p></div><div className={`frontier ${isAsymptotic ? "asymptotic" : "integer"}`}><div className="frontier-labels"><span>{isMinimization ? "PROVEN LOWER BOUND" : "BEST KNOWN LOWER BOUND"}</span><span>{isMinimization ? "BEST KNOWN UPPER BOUND" : "PROVEN UPPER BOUND"}</span></div><div className="frontier-values"><strong>{displayAchievable}</strong><div className="frontier-line"><i /><span>UNKNOWN GAP</span><i /></div><strong>{displayBound}</strong></div><div className="frontier-foot"><span>{isMinimization ? "Proven lower bound" : "Best known lower bound"}</span><span>Gap: {displayGap}</span><span>{isMinimization ? "Best known upper bound" : "Proven upper bound"}</span></div></div></section>
    <section className="canonical-columns"><div className="canonical-main"><div className="section-title" id="claims"><span>02</span><h2>Claims</h2><p>Assertions tied to evidence, attribution, and review.</p></div><div className="claims-table">{claims.length ? claims.map((claim) => <article className="public-claim" key={claim.id}><div className="claim-year">{claim.year}</div><div className="public-claim-copy"><span className="public-claim-id">{claim.id}</span><strong>{claim.relation} {formatExact(claim.value)}</strong><span>{claim.claimType.replaceAll("_", " ")}</span><small>{claim.author}</small><small>Evidence: {claim.source} · Review: {claim.epistemicStatus === "PROVEN" || claim.epistemicStatus === "FORMALLY_PROVEN" ? "Proven" : "Source confirmed"}</small></div><span className={`public-status ${claim.epistemicStatus.toLowerCase()}`}>{claim.epistemicStatus.replaceAll("_", " ")}</span></article>) : <p>No accepted Claims are recorded for this Limit yet.</p>}</div><div className="section-title lower-title" id="timeline"><span>03</span><h2>Timeline</h2><p>The frontier as it changed over time.</p></div><div className="frontier-explanation" role="note"><strong>How this frontier is derived</strong><p>Only accepted Claims matching the current specification contribute to the displayed bounds. Strict inequalities remain open; contradictory Claims require editorial review.</p></div><div className="history">{breakthroughEvents.length ? breakthroughEvents.map(({ event, claimNumber, relation, valueExact }) => <div key={event.id}><span>{event.occurredAt.toISOString().slice(0, 10)}</span><strong>{BREAKTHROUGH_LABEL[event.eventType] ?? event.eventType}</strong><small>{claimNumber ? `${claimNumber} · ${relation} ${valueExact}` : "Accepted Claim"}</small></div>) : <div><span>—</span><strong>No breakthrough events recorded yet</strong><small>Events appear here when an accepted Claim tightens a bound or closes the frontier.</small></div>}</div></div><aside className="canonical-aside"><div className="aside-block" id="specification"><span className="aside-label">Specification</span><h3>What question is being asked?</h3><p>{record.summary}</p><p className="spec-constraints">Constraints: {research?.specification ? Object.entries(research.specification.constraints).map(([key, value]) => `${key}=${value}`).join(" · ") : "Current published scope"}</p><Link href="#claims">Read full specification <span>↗</span></Link></div><div className="aside-block" id="history"><span className="aside-label">Corrections & disputes</span><h3>Record history</h3><p>No unresolved corrections or disputes are recorded for this published version.</p><Link href="#timeline">View timeline <span>↗</span></Link></div><div className="aside-block" id="evidence"><span className="aside-label">Editorial status</span><h3>Evidence-backed record</h3><p>{claims.length} accepted {claims.length === 1 ? "Claim" : "Claims"}. Current frontier last updated {lastUpdated}.</p><div className="review-meter"><span /><span /></div><small>Human-reviewed · No AI-only claims</small></div><div className="aside-block" id="bounties"><span className="aside-label">Verified prizes &amp; bounties</span><h3>Active verified incentives</h3>{bounties.length ? bounties.map(({ bounty }) => <div className="canonical-bounty" key={bounty.id}><strong>{bounty.title}</strong><span>{bounty.amount && bounty.currency ? [bounty.amount, bounty.currency].join(" ") : "Amount not specified"}</span><small>{bounty.sponsor}{bounty.expiresAt ? <> · Expires {new Date(bounty.expiresAt).toLocaleDateString()}</> : null}</small><a href={bounty.sourceUrl} target="_blank" rel="noreferrer">Official terms ↗</a></div>) : <p>No active verified bounties are linked to this Limit.</p>}<Link href="/bounties">View verified bounty tracker <span>↗</span></Link></div><div className="aside-block" id="reproducibility"><span className="aside-label">Reproducibility</span><h3>Machine-checked history</h3>{verificationHistory.length ? verificationHistory.map(({ artifact, execution, claimNumber }) => <div className="public-reproduction" key={execution.id}><strong>{claimNumber} · {artifact.verifier}</strong><span>MACHINE CHECKED · {execution.toolVersion}</span><small>Commit {artifact.commitHash.slice(0, 12)} · Output SHA-256 {execution.outputDigest.slice(0, 16)}…</small><a href={artifact.repositoryUrl} target="_blank" rel="noreferrer">Verification artifact ↗</a></div>) : <p>No accepted machine-checked reproductions are recorded for this Limit.</p>}</div><div className="aside-block citation"><span className="aside-label">Cite this Limit</span><code>{citation}</code><CopyCitationButton citation={citation} /></div></aside></section>
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><span className="footer-links"><Link href="/about">About</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/support">Support</Link><Link href="/">Back to Browse ↗</Link></span></footer>
  </main>;
}
