import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listPublicSubmissionLedger } from "../../src/db/repository.submissions";
import "./activity.css";
export const metadata: Metadata = { title: "Challenge Ledger — Limits Registry", description: "A public record of evidence-backed challenges to Registry Limits." };
type Props = { searchParams: Promise<{ status?: string }> };
const FILTERS = ["ALL", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "NEEDS_REVISION"] as const;
export default async function ActivityPage({ searchParams }: Props) {
  const [rows, params] = await Promise.all([listPublicSubmissionLedger().catch(() => []), searchParams]);
  const status = FILTERS.includes((params.status ?? "ALL") as typeof FILTERS[number]) ? params.status ?? "ALL" : "ALL";
  const visible = status === "ALL" ? rows : rows.filter(({ submission }) => submission.status === status);
  return <main className="activity-page"><PublicHeader /><section className="activity-intro"><p className="section-kicker">Public challenge ledger</p><h1>Disagreement, with receipts.</h1><p>Every challenge starts as a proposal. This ledger shows what the community has put on the table, who put their name to it, and where editorial review stands.</p><div className="activity-stats"><span><strong>${rows.length}</strong> total challenges</span><span><strong>${rows.filter(({ submission }) => submission.status === "ACCEPTED").length}</strong> accepted by editors</span></div></section><section className="activity-content"><nav className="activity-filters" aria-label="Challenge status filters">{FILTERS.map((filter) => <Link className={status === filter ? "active" : ""} href={filter === "ALL" ? "/activity" : "/activity?status=" + filter} key={filter}>${filter.replaceAll("_", " ")}</Link>)}</nav><div className="activity-list">{visible.length ? visible.map(({ submission, submitter, limit }) => <article className="activity-row" key={submission.id}><div className="activity-row-date">${new Date(submission.createdAt).toISOString().slice(0, 10)}</div><div className="activity-row-main"><span>${limit.registryNumber} · <Link href={"/limits/" + limit.registryNumber}>${limit.title}</Link></span><strong>${submission.proposedRelation} ${submission.proposedValueExact} — ${submission.title}</strong><small>Proposed by ${submitter.name}</small></div><span className={"activity-status " + submission.status.toLowerCase()}>${submission.status.replaceAll("_", " ")}</span></article>) : <p className="activity-empty">No challenges match this status.</p>}</div></section><SiteFooter /></main>;
}
