import "server-only";
import { getPaper } from "../../db/repository.entities";
import { claimNextSourceJob, completeSourceJob, failSourceJob, recoverStaleSourceJobs } from "../../db/repository.ingestion";
import { extractCandidateClaims, EXTRACTION_MODEL, EXTRACTION_PROMPT_VERSION } from "../ai/extract-claims";
import { downloadAllowedPdf, extractPdfText } from "./pdf";

const AI_TEXT_LIMIT = 50_000;
export async function processSourceIngestionBatch(limit = 2) {
  const bounded = Math.max(1, Math.min(limit, 5));
  await recoverStaleSourceJobs();
  const results: Array<{ id: string; status: string }> = [];
  for (let index = 0; index < bounded; index++) {
    const job = await claimNextSourceJob();
    if (!job) break;
    try {
      const paper = await getPaper(job.paperId);
      if (!paper) throw new Error("Paper was removed before extraction.");
      const download = await downloadAllowedPdf(job.sourceUrl);
      const pdf = await extractPdfText(download.data);
      const extraction = await extractCandidateClaims({ title: paper.title, abstract: pdf.text.slice(0, AI_TEXT_LIMIT) });
      await completeSourceJob({ jobId: job.id, finalSourceUrl: download.finalUrl, pageCount: pdf.pages, byteSize: download.bytes, extractedCharacterCount: pdf.text.length, extraction, model: EXTRACTION_MODEL, promptVersion: `${EXTRACTION_PROMPT_VERSION}+pdf-v2` });
      results.push({ id: job.id, status: "SUCCEEDED" });
    } catch (error) {
      const failed = await failSourceJob(job.id, error);
      results.push({ id: job.id, status: failed?.status ?? "FAILED" });
    }
  }
  return results;
}
