import type { MetadataRoute } from "next";
import { listPublicCategories, listPublishedLimitSitemapEntries } from "../src/db/repository";
import { categorySlug } from "../src/domain/category";
import { blogPosts } from "../src/domain/blog-posts";
import { LIMIT_COLLECTIONS } from "../src/db/repository.collections";
import { listRecentBreakthroughEvents } from "../src/db/repository.breakthroughs";
import { SITE_URL as BASE } from "../src/domain/seo";

export const revalidate = 3600;

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

// Pages whose content is a listing of published records: their honest lastmod is the newest
// record change, not the time the sitemap happened to be generated.
const RECORD_HUBS: Array<[string, number, ChangeFrequency]> = [
  ["", 1, "daily"],
  ["open-limits", 0.7, "daily"],
  ["recent", 0.6, "daily"],
  ["categories/all", 0.6, "daily"],
];

// Hand-written pages with no stored modification date. They are listed without a lastmod rather
// than with a made-up one: Google only trusts lastmod when it is consistently accurate, and
// stamping every URL with "now" on each generation teaches it to ignore the field site-wide —
// including on the record URLs, where it is real.
const STATIC_PAGES: Array<[string, number, ChangeFrequency]> = [
  ["search", 0.5, "weekly"],
  ["dependencies", 0.5, "weekly"],
  ["graph", 0.6, "weekly"],
  ["collections", 0.7, "weekly"],
  ["bounties", 0.5, "weekly"],
  ["activity", 0.5, "daily"],
  ["compare", 0.3, "monthly"],
  ["methodology", 0.5, "monthly"],
  ["about", 0.3, "yearly"],
  ["editorial-policy", 0.3, "yearly"],
  ["support", 0.2, "yearly"],
  ["accessibility", 0.2, "yearly"],
  ["privacy", 0.2, "yearly"],
  ["terms", 0.2, "yearly"],
  ["disclosure", 0.2, "yearly"],
  ["disclaimer", 0.2, "yearly"],
];

const latest = (dates: Array<Date | undefined>) => dates.reduce<Date | undefined>((max, date) => (date && (!max || date > max) ? date : max), undefined);

// Previously hardcoded 3 canonical pages by hand — every other published record (the CODATA
// batch, astrophysics, information theory, etc.) was undiscoverable through the sitemap. Now
// driven directly from what's actually published.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [limits, categories, breakthroughs] = await Promise.all([listPublishedLimitSitemapEntries(), listPublicCategories(), listRecentBreakthroughEvents(1000)]);

  // unstable_cache round-trips Date columns through JSON, so these arrive as strings.
  const limitEntries = limits.map((limit) => ({ ...limit, updatedAt: new Date(limit.updatedAt) }));
  const newestRecord = latest(limitEntries.map((limit) => limit.updatedAt));
  const newestByCategory = new Map<string, Date>();
  for (const limit of limitEntries) {
    const current = newestByCategory.get(limit.category);
    if (!current || limit.updatedAt > current) newestByCategory.set(limit.category, limit.updatedAt);
  }
  const newestBreakthrough = latest(breakthroughs.map(({ event }) => new Date(event.occurredAt)));
  const newestArticle = latest(blogPosts.map((post) => new Date(post.publishedAt)));
  const collectionDate = (collectionCategories?: string[]) => (collectionCategories?.length ? latest(collectionCategories.map((category) => newestByCategory.get(category))) : newestRecord);

  return [
    ...RECORD_HUBS.map(([path, priority, changeFrequency]) => ({ url: path ? `${BASE}/${path}` : BASE, lastModified: newestRecord, changeFrequency, priority })),
    { url: `${BASE}/breakthroughs`, lastModified: newestBreakthrough, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/articles`, lastModified: newestArticle, changeFrequency: "weekly" as const, priority: 0.6 },
    ...STATIC_PAGES.map(([path, priority, changeFrequency]) => ({ url: `${BASE}/${path}`, changeFrequency, priority })),
    ...categories.map((category) => ({ url: `${BASE}/categories/${categorySlug(category)}`, lastModified: newestByCategory.get(category), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...LIMIT_COLLECTIONS.map((collection) => ({ url: `${BASE}/collections/${collection.slug}`, lastModified: collectionDate(collection.categories), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...limitEntries.map((limit) => ({ url: `${BASE}/limits/${limit.registryNumber}`, lastModified: limit.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...breakthroughs.map(({ event }) => ({ url: `${BASE}/breakthroughs/${event.id}`, lastModified: new Date(event.occurredAt), changeFrequency: "daily" as const, priority: 0.6 })),
    ...blogPosts.map((post) => ({ url: `${BASE}/articles/${post.slug}`, lastModified: new Date(post.publishedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
