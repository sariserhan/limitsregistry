import "server-only";
import { fetchByDoi } from "./crossref";
import { fetchByArxivId } from "./arxiv";

const DOI_RE = /^10\.\d{4,9}\/\S+$/i;
const ARXIV_RE = /(\d{4}\.\d{4,5})(v\d+)?/;

/** Accepts a DOI, arXiv URL/ID, or DOI URL and fetches normalized metadata. */
export function fetchSourceMetadata(rawSource: string) {
  const source = rawSource.trim();
  const doiMatch = source.match(/10\.\d{4,9}\/\S+/i);
  const arxivMatch = source.match(ARXIV_RE);
  if (source.includes("arxiv.org") || (arxivMatch && !doiMatch)) {
    if (!arxivMatch) throw new Error("Could not find an arXiv ID in the source.");
    return fetchByArxivId(arxivMatch[1]);
  }
  if (doiMatch && DOI_RE.test(doiMatch[0])) return fetchByDoi(doiMatch[0]);
  throw new Error("Enter a DOI (10.xxxx/...) or an arXiv ID/URL.");
}
