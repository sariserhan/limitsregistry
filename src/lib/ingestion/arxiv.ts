import "server-only";
import type { FetchedPaper } from "./crossref";

function tag(entry: string, name: string) {
  const match = entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

export async function fetchByArxivId(arxivId: string): Promise<FetchedPaper> {
  const res = await fetch(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`);
  if (!res.ok) throw new Error(`arXiv lookup failed for ${arxivId} (${res.status}).`);
  const xml = await res.text();
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  if (!entry) throw new Error(`No arXiv entry found for ${arxivId}.`);
  return parseEntry(entry);
}

function parseEntry(entry: string): FetchedPaper {
  const idTag = tag(entry, "id"); // e.g. http://arxiv.org/abs/2501.12345v1
  const arxivId = idTag?.match(/abs\/([\d.]+)/)?.[1] ?? "";
  const title = tag(entry, "title") ?? arxivId;
  const summary = tag(entry, "summary");
  const published = tag(entry, "published");
  return {
    title,
    abstract: summary,
    publicationDate: published ? new Date(published) : null,
    venue: "arXiv",
    doi: null,
    arxivId,
    publisherUrl: `https://arxiv.org/abs/${arxivId}`,
  };
}

/** Most recent papers in the given arXiv categories, newest first — used by the arXiv radar cron. */
export async function fetchRecentArxivPapers(categories: string[], maxResults: number): Promise<FetchedPaper[]> {
  // Build with real spaces, not literal "+" — encodeURIComponent would otherwise escape a
  // literal "+" to "%2B", which arXiv's query parser reads as the character "+", not as OR.
  const searchQuery = categories.map((c) => `cat:${c}`).join(" OR ");
  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(searchQuery)}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv search failed (${res.status}).`);
  const xml = await res.text();
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
  return entries.map(parseEntry).filter((paper) => paper.arxivId);
}
