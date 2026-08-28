import type { MetadataRoute } from "next";

// Previously only disallowed /api/ and /admin/ — every other auth-gated or no-content-value page
// (login, the console, account, submit, watchlists, ...) was left crawlable, wasting crawl budget
// on pages that just redirect to /login for an anonymous crawler.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/developers",
        "/admin/",
        "/console/",
        "/login",
        "/signup",
        "/account",
        "/submit",
        "/watchlists",
        "/reviewer-profile",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: "https://www.limitsregistry.com/sitemap.xml",
  };
}
