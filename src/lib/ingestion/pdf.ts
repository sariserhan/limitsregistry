import "server-only";
import { PDFParse } from "pdf-parse";

export async function extractPdfText(source: string | Uint8Array): Promise<{ text: string; pages: number }> {
  const parser = typeof source === "string" ? new PDFParse({ url: source }) : new PDFParse({ data: source });
  try { const result = await parser.getText(); return { text: result.text, pages: result.total }; }
  finally { await parser.destroy(); }
}
