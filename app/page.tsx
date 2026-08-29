import BrowseClient from "./browse-client";
import { getRegistryStats } from "../src/db/repository";
import { listPublishedBrowseFacets, listPublishedBrowsePage, type BrowseStatus } from "../src/db/repository.browse";
import { listRecentBreakthroughEvents } from "../src/db/repository.breakthroughs";
import { listPublicBounties } from "../src/db/repository.research";
import { formatExact, publishedLimits, type PublishedLimit } from "../src/domain/published";
import type { ExactValue } from "../src/domain/types";
import { deriveFrontierPresentation } from "../src/domain/frontier-presentation";
import { buildSiteJsonLd, buildFaqJsonLd, jsonLdScript } from "../src/domain/structured-data";
import { blogPosts } from "../src/domain/blog-posts";
import { HOMEPAGE_FAQ } from "../src/domain/faq";

export const revalidate = 60;
const displayValue = (value: Parameters<typeof formatExact>[0]): ExactValue | null => value ? { kind: "text", value: formatExact(value) } : null;
type HomeProps = { searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = Math.max(Number.parseInt(params.page ?? "1", 10) || 1, 1);
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const status = (params.status === "OPEN" || params.status === "PROVEN" || params.status === "DISPUTED" || params.status === "RETIRED" ? params.status : "ALL") as BrowseStatus;
  const [browseResult, facets, stats, recentBreakthroughs, bountyRows] = await Promise.all([
    listPublishedBrowsePage({ page, pageSize: 3, query, category, status }).catch(() => null),
    listPublishedBrowseFacets().catch(() => ({ categories: [], statuses: [] })),
    getRegistryStats().catch(() => null),
    listRecentBreakthroughEvents(3).catch(() => []),
    listPublicBounties().catch(() => []),
  ]);
  const recent = recentBreakthroughs.map((row) => ({ id: row.event.id, registryNumber: row.limit.registryNumber, eventType: row.event.eventType, occurredAt: row.event.occurredAt.toISOString() }));
  const featuredBounties = bountyRows.slice().sort((a, b) => Number(b.bounty.amount ?? 0) - Number(a.bounty.amount ?? 0)).slice(0, 3).map(({ bounty, limit }) => ({ id: bounty.id, title: bounty.title, sponsor: bounty.sponsor, amount: bounty.amount, currency: bounty.currency, registryNumber: limit.registryNumber }));
  const featuredArticles = blogPosts.slice(0, 3).map((post) => ({ slug: post.slug, title: post.title, dek: post.dek }));
  const fallbackLimits = publishedLimits.filter((limit) => (!query || `${limit.title} ${limit.category} ${limit.id}`.toLowerCase().includes(query.toLowerCase())) && (!category || limit.category === category) && (status === "ALL" || limit.status === status)).sort((left, right) => (Date.parse(right.publishedAt ?? "") || 0) - (Date.parse(left.publishedAt ?? "") || 0) || left.id.localeCompare(right.id));
  const limits: PublishedLimit[] = browseResult ? browseResult.rows.map(({ limit, specification, claims, timeline, frontier }) => {
    const fallback = publishedLimits.find((item) => item.id === limit.registryNumber) ?? publishedLimits[0];
    const safeFrontier = { ...frontier, lowerBound: displayValue(frontier.lowerBound), upperBound: displayValue(frontier.upperBound), achievable: displayValue(frontier.achievable) };
    return { ...fallback, publishedAt: limit.publishedAt?.toISOString(), id: limit.registryNumber, title: limit.title, category: limit.category, summary: limit.summary, direction: limit.direction, status: limit.status as PublishedLimit["status"], achievable: formatExact(frontier.lowerBound), bound: formatExact(frontier.upperBound), gap: frontier.gap, claims: claims.length, papers: 0, specification, claimsData: claims, timelineData: timeline.map((event) => ({ ...event, occurredAt: new Date(event.occurredAt).toISOString() })), frontier: safeFrontier, frontierPresentation: deriveFrontierPresentation(specification.recordKind, claims, frontier) };
  }) : fallbackLimits.slice((page - 1) * 3, page * 3);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(buildSiteJsonLd()) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(buildFaqJsonLd(HOMEPAGE_FAQ)) }} />
    <BrowseClient key={query + "|" + category + "|" + status + "|" + page} initialLimits={limits} total={browseResult?.total ?? fallbackLimits.length} currentPage={browseResult?.page ?? page} pageCount={browseResult?.pageCount ?? Math.max(1, Math.ceil(fallbackLimits.length / 3))} categoryCounts={browseResult ? facets.categories : Array.from(new Map(fallbackLimits.map((limit) => [limit.category, (fallbackLimits.filter((item) => item.category === limit.category).length)])).entries())} statusCounts={browseResult ? facets.statuses : []} initialQuery={query} initialCategory={category} initialStatus={status} stats={stats} recentBreakthroughs={recent} featuredBounties={featuredBounties} featuredArticles={featuredArticles} faq={HOMEPAGE_FAQ} />
  </>;
}
