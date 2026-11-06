import { vi } from "vitest";
vi.mock("server-only", () => ({}));
import { describe, expect, it } from "vitest";
import { downloadAllowedPdf, extractPdfText, MAX_PDF_BYTES } from "./pdf";
const noDns = async () => {};

describe("bounded PDF download", () => {
  it("accepts a small allowlisted PDF and records its final size", async () => {
    const fetcher = vi.fn(async () => new Response(new TextEncoder().encode("%PDF-fixture"), { status: 200, headers: { "content-type": "application/pdf" } }));
    const result = await downloadAllowedPdf("https://arxiv.org/pdf/1.pdf", fetcher as typeof fetch, noDns);
    expect(result.bytes).toBe(12);
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it("validates every redirect target against the allowlist", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 302, headers: { location: "https://evil.example/file.pdf" } }));
    await expect(downloadAllowedPdf("https://arxiv.org/pdf/1.pdf", fetcher as typeof fetch, noDns)).rejects.toThrow("not allowlisted");
  });
  it("rejects oversized responses before reading the body", async () => {
    const fetcher = vi.fn(async () => new Response(new Uint8Array(), { status: 200, headers: { "content-type": "application/pdf", "content-length": String(MAX_PDF_BYTES + 1) } }));
    await expect(downloadAllowedPdf("https://arxiv.org/pdf/1.pdf", fetcher as typeof fetch, noDns)).rejects.toThrow("15 MB");
  });
});

describe("extractPdfText", () => {
  it("parses a real PDF in Node, where DOMMatrix is not a global", async () => {
    const stream = "BT /F1 12 Tf 72 720 Td (Registry limit text) Tj ET";
    const pdf = [
      "%PDF-1.4",
      "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
      "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj",
      `4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream endobj`,
      "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
      "trailer<</Root 1 0 R>>",
    ].join("\n");

    const result = await extractPdfText(new TextEncoder().encode(pdf));

    expect(result.pages).toBe(1);
    expect(result.text).toContain("Registry limit text");
  }, 30_000);
});
