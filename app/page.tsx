import BrowseClient from "./browse-client";
import { listPublishedLimitsWithFrontiers, getRegistryStats } from "../src/db/repository";
import { listRecentBreakthroughEvents } from "../src/db/repository.breakthroughs";
import { listPublicBounties } from "../src/db/repository.research";
import { formatExact, publishedLimits, type PublishedLimit } from "../src/domain/published";
import type { ExactValue } from "../src/domain/types";
import { deriveFrontierPresentation } from "../src/domain/frontier-presentation";
import { buildSiteJsonLd, jsonLdScript } from "../src/domain/structured-data";

export const revalidate = 60;
const displayValue = (value: Parameters<typeof formatExact>[0]): ExactValue | null => value ? { kind: "text", value: formatExact(value) } : null;

export default async function Home() {
  let databaseRows: Awaited<ReturnType<typeof listPublishedLimitsWithFrontiers>> = [];
  try { databaseRows = await listPublishedLimitsWithFrontiers(); } catch { databaseRows = []; }
  const stats = await getRegistryStats().catch(() => null);
  const recentBreakthroughs = (await listRecentBreakthroughEvents(3).catch(() => [])).map((row) => ({ id: row.event.id, registryNumber: row.limit.registryNumber, eventType: row.event.eventType, occurredAt: row.event.occurredAt.toISOString() }));
  const featuredBounties = (await listPublicBounties().catch(() => []))
    .slice().sort((a, b) => Number(b.bounty.amount ?? 0) - Number(a.bounty.amount ?? 0)).slice(0, 3)
    .map(({ bounty, limit }) => ({ id: bounty.id, title: bounty.title, sponsor: bounty.sponsor, amount: bounty.amount, currency: bounty.currency, registryNumber: limit.registryNumber }));
  const limits: PublishedLimit[] = databaseRows.length ? databaseRows.map(({ limit, specification, claims, timeline, frontier }) => {
    const fallback = publishedLimits.find((item) => item.id === limit.registryNumber) ?? publishedLimits[0];
    const safeFrontier = { ...frontier, lowerBound: displayValue(frontier.lowerBound), upperBound: displayValue(frontier.upperBound), achievable: displayValue(frontier.achievable) };
    return { ...fallback, publishedAt: limit.publishedAt?.toISOString(), id: limit.registryNumber, title: limit.title, category: limit.category, summary: limit.summary, direction: limit.direction, status: limit.status === "DRAFT" ? "OPEN" : limit.status, achievable: formatExact(frontier.lowerBound), bound: formatExact(frontier.upperBound), gap: frontier.gap, claims: claims.length, papers: 0, specification, claimsData: claims, timelineData: timeline.map((event) => ({ ...event, occurredAt: event.occurredAt.toISOString() })), frontier: safeFrontier, frontierPresentation: deriveFrontierPresentation(specification.recordKind, claims, frontier) };
  }) : publishedLimits;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(buildSiteJsonLd()) }} />
    <BrowseClient initialLimits={limits} stats={stats} recentBreakthroughs={recentBreakthroughs} featuredBounties={featuredBounties} />
  </>;
}
