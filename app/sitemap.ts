import type { MetadataRoute } from "next";
import { listPublicCategories, listPublishedLimits } from "../src/db/repository";
import { categorySlug } from "../src/domain/category";
import { blogPosts } from "../src/domain/blog-posts";

export const revalidate = 3600;

const BASE = "https://www.limitsregistry.com";

// path, priority, changeFrequency
const STATIC_PAGES: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["", 1, "daily"],
  ["open-limits", 0.7, "daily"],
  ["search", 0.5, "weekly"],
  ["dependencies", 0.5, "weekly"],
  ["breakthroughs", 0.6, "daily"],
  ["recent", 0.6, "daily"],
  ["bounties", 0.5, "weekly"],
  ["activity", 0.5, "daily"],
  ["compare", 0.3, "monthly"],
  ["blog", 0.6, "weekly"],
  ["methodology", 0.5, "monthly"],
  ["developers", 0.4, "monthly"],
  ["about", 0.3, "yearly"],
  ["editorial-policy", 0.3, "yearly"],
  ["support", 0.2, "yearly"],
  ["accessibility", 0.2, "yearly"],
  ["privacy", 0.2, "yearly"],
  ["terms", 0.2, "yearly"],
  ["disclosure", 0.2, "yearly"],
  ["disclaimer", 0.2, "yearly"],
];

// Previously hardcoded 3 canonical pages by hand — every other published record (the CODATA
// batch, astrophysics, information theory, etc.) was undiscoverable through the sitemap. Now
// driven directly from what's actually published.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [limits, categories] = await Promise.all([listPublishedLimits(), listPublicCategories()]);
  const now = new Date();

  return [
    ...STATIC_PAGES.map(([path, priority, changeFrequency]) => ({ url: path ? `${BASE}/${path}` : BASE, lastModified: now, changeFrequency, priority })),
    { url: `${BASE}/categories/all`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    ...categories.map((category) => ({ url: `${BASE}/categories/${categorySlug(category)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...limits.map((limit) => ({ url: `${BASE}/limits/${limit.registryNumber}`, lastModified: new Date(limit.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...blogPosts.map((post) => ({ url: `${BASE}/blog/${post.slug}`, lastModified: new Date(post.publishedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
