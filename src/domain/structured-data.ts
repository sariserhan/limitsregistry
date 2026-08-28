const SITE_URL = "https://www.limitsregistry.com";

/**
 * schema.org Dataset markup for a canonical record — a Limit is closest in shape to a dataset
 * entry (a named, sourced, versioned measurement) among schema.org's well-supported types, and
 * Dataset gets a real rich-result treatment in Google Search. Only includes fields with a real
 * backing value; a legacy/demo record with no database row behind it (getPublishedLimit /
 * getCanonicalRecord fallbacks) still gets name/description/identifier/url, just nothing that
 * would need to be invented (datePublished, citations, measured value).
 */
export function buildRecordJsonLd(input: {
  registryNumber: string;
  title: string;
  summary: string;
  category: string;
  metricName?: string;
  unit?: string | null;
  // Comes from a cached repository read (getPublishedLimit -> unstable_cache), which
  // round-trips Date columns through JSON as strings — accept either rather than assume Date.
  publishedAt?: Date | string | null;
  sourceUrls?: string[];
}) {
  const url = `${SITE_URL}/limits/${input.registryNumber}`;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.title,
    description: input.summary,
    identifier: input.registryNumber,
    url,
    keywords: input.category,
    ...(input.metricName ? { variableMeasured: input.unit ? `${input.metricName} (${input.unit})` : input.metricName } : {}),
    ...(input.publishedAt ? { datePublished: new Date(input.publishedAt).toISOString() } : {}),
    ...(input.sourceUrls?.length ? { citation: input.sourceUrls } : {}),
    creator: { "@type": "Organization", name: "Limits Registry", url: SITE_URL },
    isAccessibleForFree: true,
  };
}
