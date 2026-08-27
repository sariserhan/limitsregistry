const STOPWORDS = new Set(["the", "a", "an", "of", "for", "and", "or", "in", "on", "to", "is", "with", "by", "new", "improved", "via", "using", "from", "than"]);

function significantWords(text: string): Set<string> {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOPWORDS.has(w)));
}

export type LimitIdentity = { id: string; title: string };

/**
 * Best-effort keyword overlap between a paper and known Limits — advisory only, used to
 * pre-link a radar-ingested candidate claim to a likely Limit. A wrong or missing match is
 * safe: the candidate still lands in the editorial queue (linked or not) for a human to
 * confirm during review, same as a manually-extracted candidate.
 */
export function matchLimitForPaper(paper: { title: string; abstract: string | null }, limits: LimitIdentity[]): string | null {
  const paperWords = significantWords(`${paper.title} ${paper.abstract ?? ""}`);
  if (paperWords.size === 0) return null;
  let best: { id: string; score: number } | null = null;
  for (const limit of limits) {
    const limitWords = significantWords(limit.title);
    if (limitWords.size === 0) continue;
    let overlap = 0;
    for (const word of limitWords) if (paperWords.has(word)) overlap++;
    const score = overlap / limitWords.size;
    if (score >= 0.6 && (!best || score > best.score)) best = { id: limit.id, score };
  }
  return best?.id ?? null;
}
