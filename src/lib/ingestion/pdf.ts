import "server-only";
import { lookup } from "node:dns/promises";
import { PDFParse } from "pdf-parse";
import { isPrivateIp, validatePdfSourceUrl } from "./source-security";

export const MAX_PDF_BYTES = 15 * 1024 * 1024;
export const MAX_PDF_PAGES = 300;
export const MAX_EXTRACTED_CHARACTERS = 200_000;
const FETCH_TIMEOUT_MS = 25_000;
const MAX_REDIRECTS = 3;

async function assertPublicDns(hostname: string) {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) throw new Error("PDF host resolved to a private or unavailable address.");
}

export async function downloadAllowedPdf(rawUrl: string, fetcher: typeof fetch = fetch, resolveHost: (hostname: string) => Promise<void> = assertPublicDns): Promise<{ data: Uint8Array; finalUrl: string; bytes: number }> {
  let url = validatePdfSourceUrl(rawUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    await resolveHost(url.hostname);
    const response = await fetcher(url, { redirect: "manual", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), headers: { Accept: "application/pdf", "User-Agent": "LimitsRegistry/1.0 source-ingestion" } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === MAX_REDIRECTS) throw new Error("PDF redirect limit exceeded.");
      url = validatePdfSourceUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`PDF download failed (${response.status}).`);
    const declared = Number(response.headers.get("content-length") ?? 0);
    if (declared > MAX_PDF_BYTES) throw new Error("PDF exceeds the 15 MB download limit.");
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/pdf") && !url.pathname.toLowerCase().endsWith(".pdf")) throw new Error("Source did not return a PDF document.");
    if (!response.body) throw new Error("PDF response had no body.");
    const chunks: Uint8Array[] = []; let bytes = 0;
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) { bytes += chunk.byteLength; if (bytes > MAX_PDF_BYTES) throw new Error("PDF exceeds the 15 MB download limit."); chunks.push(chunk); }
    const data = new Uint8Array(bytes); let offset = 0; for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
    if (bytes < 5 || new TextDecoder().decode(data.slice(0, 5)) !== "%PDF-") throw new Error("Downloaded file does not have a PDF signature.");
    return { data, finalUrl: url.toString(), bytes };
  }
  throw new Error("PDF redirect limit exceeded.");
}

export async function extractPdfText(source: Uint8Array): Promise<{ text: string; pages: number }> {
  const parser = new PDFParse({ data: source });
  try {
    const result = await parser.getText();
    if (result.total > MAX_PDF_PAGES) throw new Error(`PDF exceeds the ${MAX_PDF_PAGES}-page extraction limit.`);
    const text = result.text.slice(0, MAX_EXTRACTED_CHARACTERS);
    if (!text.trim()) throw new Error("PDF contained no extractable text.");
    return { text, pages: result.total };
  } finally { await parser.destroy(); }
}
