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
