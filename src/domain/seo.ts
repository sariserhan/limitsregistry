import type { Metadata } from "next";

/** The one origin every canonical, og:url, sitemap entry and JSON-LD url points at. The apex and
 * the .vercel.app host both redirect here (see src/ops/canonical-host.ts). */
export const SITE_URL = "https://www.limitsregistry.com";

/** Absolute URL on the canonical origin. The homepage is the bare origin, matching the sitemap. */
export function absoluteUrl(path: string) {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Per-page metadata with a self-referencing canonical and a matching og:url.
 *
 * Next.js replaces (does not merge) a parent's `openGraph` when a page sets its own, and a page
 * that sets none inherits the root layout's — whose og:url is the homepage. So every public page
 * goes through here: canonical, og:url and twitter card always describe the same URL.
 */
export function pageMetadata(input: { path: string; title: string; description?: string; type?: "website" | "article"; images?: string[] }): Metadata {
  const url = absoluteUrl(input.path);
  return {
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    alternates: { canonical: url },
    openGraph: { siteName: "Limits Registry", type: input.type ?? "website", title: input.title, url, ...(input.description ? { description: input.description } : {}), ...(input.images ? { images: input.images } : {}) },
    twitter: { card: "summary_large_image", title: input.title, ...(input.description ? { description: input.description } : {}), ...(input.images ? { images: input.images } : {}) },
  };
}
