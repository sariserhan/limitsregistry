import { vi } from "vitest";
vi.mock("server-only", () => ({}));
import { describe, expect, it } from "vitest";
import { downloadAllowedPdf, MAX_PDF_BYTES } from "./pdf";
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
