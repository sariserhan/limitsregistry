export type PaperIdentity = { id: string; doi: string | null; arxivId: string | null; title: string };

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Strongest match wins: DOI, then arXiv ID, then normalized-title equality. */
export function findDuplicatePaper(existing: PaperIdentity[], candidate: { doi?: string | null; arxivId?: string | null; title: string }) {
  if (candidate.doi) {
    const byDoi = existing.find((p) => p.doi && p.doi.toLowerCase() === candidate.doi!.toLowerCase());
    if (byDoi) return byDoi;
  }
  if (candidate.arxivId) {
    const byArxiv = existing.find((p) => p.arxivId && p.arxivId === candidate.arxivId);
    if (byArxiv) return byArxiv;
  }
  const normalized = normalizeTitle(candidate.title);
  return existing.find((p) => normalizeTitle(p.title) === normalized) ?? null;
}
