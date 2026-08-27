import "server-only";

export type FetchedPaper = { title: string; abstract: string | null; publicationDate: Date | null; venue: string | null; doi: string | null; arxivId: string | null; publisherUrl: string | null };

export async function fetchByDoi(doi: string): Promise<FetchedPaper> {
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Crossref lookup failed for ${doi} (${res.status}).`);
  const { message } = (await res.json()) as { message: Record<string, unknown> };
  const title = Array.isArray(message.title) ? (message.title[0] as string) : String(message.title ?? doi);
  const dateParts = message["published-print"] ?? message["published-online"] ?? message.issued;
  const [y, m = 1, d = 1] = ((dateParts as { "date-parts"?: number[][] } | undefined)?.["date-parts"]?.[0] ?? []) as number[];
  return {
    title,
    abstract: typeof message.abstract === "string" ? message.abstract.replace(/<[^>]+>/g, "") : null,
    publicationDate: y ? new Date(Date.UTC(y, m - 1, d)) : null,
    venue: Array.isArray(message["container-title"]) ? (message["container-title"][0] as string) ?? null : null,
    doi: (message.DOI as string) ?? doi,
    arxivId: null,
    publisherUrl: (message.URL as string) ?? null,
  };
}
