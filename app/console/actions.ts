"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../src/auth/session";
import { fetchSourceMetadata } from "../../src/lib/ingestion/intake";
import { enqueueSourceIngestion } from "../../src/db/repository.ingestion";
import { getPaper } from "../../src/db/repository.entities";
import { findDuplicatePaper } from "../../src/domain/duplicate-detection";
import { extractCandidateClaims, EXTRACTION_MODEL, EXTRACTION_PROMPT_VERSION } from "../../src/lib/ai/extract-claims";
import { insertCandidateClaim, insertPaper, listPapers, setCandidateClaimStatus } from "../../src/db/repository.console";
import { getSubmissionNotification, setSubmissionStatus } from "../../src/db/repository.submissions";
import { sendSubmissionDecisionEmail } from "../../src/lib/email/submission-emails";
import { refreshPublicSearchIndex } from "../../src/db/repository.search";

// Every action here used to plain `throw new Error(...)` on a validation failure — with no local
// error boundary on this page, that propagated straight to the root error.tsx and replaced the
// entire Research Console (all tabs, every loaded source/claim) for something as ordinary as a
// missing abstract or an already-decided claim. done() on the success path must run OUTSIDE any
// try — it calls redirect(), which throws by design, and a redirect thrown from inside a try is
// caught by that try's own catch and misreported as an error (the thrown error's .message is
// literally "NEXT_REDIRECT").
const done = (message: string, error = false): never => redirect(`/console?${error ? "error" : "success"}=${encodeURIComponent(message)}`);

export async function importBibtex(formData: FormData) {
  await requireRole("RESEARCHER");
  const input = String(formData.get("bibtex") ?? "").trim();
  if (!input || input.length > 200000) done("Provide a BibTeX file up to 200 KB.", true);
  const entries = [...input.matchAll(/@(?:article|inproceedings|misc)\s*\{([\s\S]*?)\n\s*\}/gi)];
  let imported = 0;
  try {
    for (const match of entries) {
      const block = match[1];
      const field = (name: string) => block.match(new RegExp(`${name}\\s*=\\s*[\\{\\"]([\\s\\S]*?)[\\}\\"]\\s*,?`, "i"))?.[1]?.trim();
      const title = field("title");
      if (!title) continue;
      const doi = field("doi") ?? null;
      const arxivId = field("eprint") ?? null;
      if ((await listPapers()).some((paper) => (doi && paper.doi === doi) || (arxivId && paper.arxivId === arxivId) || paper.title.toLowerCase() === title.toLowerCase())) continue;
      await insertPaper({ title, abstract: null, publicationDate: field("year") ? new Date(Date.UTC(Number(field("year")), 0, 1)) : null, venue: field("journal") ?? field("booktitle") ?? null, doi, arxivId, publisherUrl: field("url") ?? null });
      imported++;
    }
    if (!entries.length) done("No supported BibTeX entries found.", true);
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "Bibliography could not be imported.", true); }
  done(`Imported ${imported} draft source${imported === 1 ? "" : "s"}.`);
}

export async function addSource(formData: FormData) {
  await requireRole("RESEARCHER");
  const rawSource = String(formData.get("source") ?? "").trim();
  if (!rawSource) done("Enter a DOI or arXiv ID/URL.", true);
  try {
    const meta = await fetchSourceMetadata(rawSource);
    const existing = await listPapers();
    const duplicate = findDuplicatePaper(existing, meta);
    if (!duplicate) await insertPaper(meta);
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "Source metadata could not be fetched.", true); }
  done("Source added.");
}

export async function runExtraction(formData: FormData) {
  await requireRole("RESEARCHER");
  const paperId = String(formData.get("paperId"));
  const title = String(formData.get("title"));
  const abstract = String(formData.get("abstract") ?? "");
  const limitId = String(formData.get("limitId") ?? "") || null;
  if (!abstract) done("This paper has no abstract to extract from.", true);
  try {
    const extraction = await extractCandidateClaims({ title, abstract });
    await insertCandidateClaim({ paperId, limitId, extraction, model: EXTRACTION_MODEL, promptVersion: EXTRACTION_PROMPT_VERSION });
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "Candidate claims could not be extracted.", true); }
  done("Candidate claims extracted.");
}

export async function extractPdfCandidateClaims(formData: FormData) {
  const session = await requireRole("RESEARCHER");
  const paperId = String(formData.get("paperId") ?? "");
  const limitId = String(formData.get("limitId") ?? "") || null;
  try {
    const paper = await getPaper(paperId);
    if (!paper) done("Paper not found.", true);
    const suppliedUrl = String(formData.get("pdfUrl") ?? "").trim();
    const sourceUrl = suppliedUrl || (paper.arxivId ? `https://arxiv.org/pdf/${encodeURIComponent(paper.arxivId)}.pdf` : "");
    if (!sourceUrl) done("Add an allowlisted official publisher PDF URL.", true);
    await enqueueSourceIngestion({ paperId, limitId, requestedByUserId: session.user.id, sourceUrl, sourceType: paper.arxivId && !suppliedUrl ? "ARXIV" : "DOI_PUBLISHER" });
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "PDF extraction could not be queued.", true); }
  done("PDF extraction queued.");
}

export async function decideCandidateClaim(formData: FormData) {
  const session = await requireRole("EDITOR");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  if (decision !== "PROMOTED" && decision !== "DISMISSED") done("Invalid decision.", true);
  try {
    await setCandidateClaimStatus(id, decision as "PROMOTED" | "DISMISSED", session.user.id);
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "Decision could not be saved.", true); }
  done(`Candidate claim ${decision.toLowerCase()}.`);
}

const SUBMISSION_DECISIONS = ["ACCEPTED", "REJECTED", "NEEDS_REVISION"] as const;

export async function decideSubmission(formData: FormData) {
  const session = await requireRole("EDITOR");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  const notes = String(formData.get("notes") ?? "").trim();
  if (!SUBMISSION_DECISIONS.includes(decision as (typeof SUBMISSION_DECISIONS)[number])) done("Invalid decision.", true);
  if (!notes) done("Add a note explaining the decision.", true);
  try {
    await setSubmissionStatus(id, decision as (typeof SUBMISSION_DECISIONS)[number], session.user.id, notes);
    const record = await getSubmissionNotification(id);
    if (record) void sendSubmissionDecisionEmail(record.submitter.email, record.submitter.name, record.limit.registryNumber, record.submission.title, decision, notes, id).catch((error) => console.error("[submission] decision email failed", error));
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "Decision could not be saved.", true); }
  done(`Submission ${decision.toLowerCase()}.`);
}

export async function reindexSemanticSearch() {
  await requireRole("EDITOR");
  try {
    await refreshPublicSearchIndex();
    revalidatePath("/search");
    revalidatePath("/console");
  } catch (error) { done(error instanceof Error ? error.message : "Semantic index could not be refreshed.", true); }
  done("Semantic index refreshed.");
}
