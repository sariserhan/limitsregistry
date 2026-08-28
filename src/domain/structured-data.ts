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

/** WebSite + Organization markup for the homepage — establishes the site's identity for Google
 * (sitelinks search box eligibility via the SearchAction) once per site, not once per page. */
export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Limits Registry",
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Limits Registry",
        description: "A curated public record of the verified boundaries of what is possible.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** FAQPage markup for the homepage FAQ section — eligible for a rich FAQ result in Google Search. */
export function buildFaqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** JSON.stringify doesn't escape "</script>" — a value containing that literal substring could
 * otherwise close the script tag early and inject markup. < keeps it inert. Use for every
 * JSON-LD script tag, not just record pages. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
