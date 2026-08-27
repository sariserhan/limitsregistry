import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://limitsregistry.com";
  return [{ url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }, { url: `${base}/limits/LR-000072`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 }, { url: `${base}/limits/LR-000098`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 }, { url: `${base}/limits/LR-000127`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 }];
}
