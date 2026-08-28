import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { listRecentBreakthroughEvents } from "../../src/db/repository.breakthroughs";
import "./breakthroughs.css";

export const revalidate = 60;
export const metadata: Metadata = { title: "Breakthroughs — Limits Registry", description: "Recently accepted stronger bounds, constructions, and frontier closures across the Registry." };

const LABEL: Record<string, string> = { STRONGER_BOUND: "Stronger bound accepted", FRONTIER_CLOSED: "Frontier closed" };

export default async function BreakthroughsPage() {
  const events = await listRecentBreakthroughEvents(50);
  return <main className="breakthroughs-page">
    <PublicHeader />
    <section className="breakthroughs-intro">
      <p className="section-kicker">Recent activity</p>
      <h1>What just moved.</h1>
      <p>Every accepted Claim that tightened a bound or closed a frontier, across the whole Registry. Nothing here is AI-generated — these fire only after an editor accepts a Claim.</p>
      <a href="/api/breakthroughs/rss">Subscribe to the site-wide feed ↗</a>
    </section>
    <section className="breakthrough-explanation" aria-labelledby="breakthrough-explanation-title">
      <div className="breakthrough-explanation-copy">
        <p className="section-kicker">How to read it</p>
        <h2 id="breakthrough-explanation-title">A record of what moved.</h2>
        <p>Each item marks a published Limit whose accepted Claim changed the recorded frontier. This is a timeline of meaningful updates, not a ranking of researchers or papers.</p>
      </div>
      <div className="breakthrough-explanation-grid">
        <article>
          <span className="breakthrough-explanation-number">01</span>
          <strong>Stronger bound accepted</strong>
          <p>A new Claim improves the best known lower bound, upper bound, or achievable construction.</p>
        </article>
        <article>
          <span className="breakthrough-explanation-number">02</span>
          <strong>Frontier closed</strong>
          <p>Matching evidence closes the gap under the current specification, establishing an exact result.</p>
        </article>
        <article>
          <span className="breakthrough-explanation-number">03</span>
          <strong>Why it appears</strong>
          <p>Only accepted Claims with evidence on public Limits appear in this feed. Draft and rejected work stays out.</p>
        </article>
      </div>
    </section>
    <section className="breakthroughs-list">
      {events.length ? events.map(({ event, claimNumber, relation, valueExact, limit }) => <article className="breakthrough-item" key={event.id}>
        <div className="breakthrough-item-copy">
          <strong><Link href={`/limits/${limit.registryNumber}`}>{limit.registryNumber} — {limit.title}</Link></strong>
          <small>{claimNumber ? `${claimNumber} · ${relation} ${valueExact}` : "Accepted Claim"} · {event.occurredAt.toISOString().slice(0, 10)}</small>
        </div>
        <span className={`breakthrough-badge ${event.eventType.toLowerCase()}`}>{LABEL[event.eventType] ?? event.eventType}</span>
      </article>) : <div className="breakthroughs-empty" role="status"><strong>No breakthroughs recorded yet.</strong><span>Events appear here the moment an accepted Claim tightens a bound or closes a frontier anywhere in the Registry.</span></div>}
    </section>
  </main>;
}
