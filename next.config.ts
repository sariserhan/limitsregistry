import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Streaming metadata is off for every user agent. With it on, pages whose generateMetadata is
  // async (every /limits/[id] record, categories, researchers...) sent <title>, the description and
  // rel="canonical" at the end of <body> to Googlebot, which is not on Next's default
  // "HTML-limited" list. A canonical outside <head> is ignored, and Search Console was choosing its
  // own canonical for those records. Metadata reads go through the same cached repository calls as
  // the page, so blocking on them costs little.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
