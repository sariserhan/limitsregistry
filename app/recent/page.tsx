import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listRecentTimelineEvents } from "../../src/db/repository";
import "../breakthroughs/breakthroughs.css";

export const revalidate = 60;
export const metadata: Metadata = { title: "Recently updated — Limits Registry", description: "Every timeline event across the Registry — new publications, specification changes, and breakthroughs — not just bound improvements." };

function label(eventType: string) {
  return eventType.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export default async function RecentPage() {
  const events = await listRecentTimelineEvents(50);
  return <main className="breakthroughs-page">
    <PublicHeader />
    <section className="breakthroughs-intro">
      <p className="section-kicker">Recent activity</p>
      <h1>Recently updated.</h1>
      <p>Every timeline event across the Registry — new publications, specification changes, and breakthroughs. Broader than the <Link href="/breakthroughs">breakthroughs feed</Link>, which covers only bound improvements.</p>
    </section>
    <section className="breakthroughs-list">
      {events.length ? events.map(({ event, limit }) => <article className="breakthrough-item" key={event.id}>
        <div className="breakthrough-item-copy">
          <strong><Link href={`/limits/${limit.registryNumber}`}>{limit.registryNumber} — {limit.title}</Link></strong>
          <small>{event.title} · {event.occurredAt.toISOString().slice(0, 10)}</small>
        </div>
        <span className="breakthrough-badge">{label(event.eventType)}</span>
      </article>) : <div className="breakthroughs-empty" role="status"><strong>No activity recorded yet.</strong><span>Events appear here whenever a record is published or its specification changes.</span></div>}
    </section>
    <SiteFooter />
  </main>;
}
