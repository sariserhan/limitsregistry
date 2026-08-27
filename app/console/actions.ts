"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../src/auth/session";
import { fetchSourceMetadata } from "../../src/lib/ingestion/intake";
import { findDuplicatePaper } from "../../src/domain/duplicate-detection";
import { extractCandidateClaims, EXTRACTION_MODEL, EXTRACTION_PROMPT_VERSION } from "../../src/lib/ai/extract-claims";
import { insertCandidateClaim, insertPaper, listPapers, setCandidateClaimStatus } from "../../src/db/repository.console";
import { setSubmissionStatus } from "../../src/db/repository.submissions";

export async function addSource(formData: FormData) {
  await requireRole("RESEARCHER");
  const rawSource = String(formData.get("source") ?? "").trim();
  if (!rawSource) throw new Error("Enter a DOI or arXiv ID/URL.");

  const meta = await fetchSourceMetadata(rawSource);
  const existing = await listPapers();
  const duplicate = findDuplicatePaper(existing, meta);
  if (!duplicate) await insertPaper(meta);
  revalidatePath("/console");
}

export async function runExtraction(formData: FormData) {
  await requireRole("RESEARCHER");
  const paperId = String(formData.get("paperId"));
  const title = String(formData.get("title"));
  const abstract = String(formData.get("abstract") ?? "");
  const limitId = String(formData.get("limitId") ?? "") || null;
  if (!abstract) throw new Error("This paper has no abstract to extract from.");

  const extraction = await extractCandidateClaims({ title, abstract });
  await insertCandidateClaim({ paperId, limitId, extraction, model: EXTRACTION_MODEL, promptVersion: EXTRACTION_PROMPT_VERSION });
  revalidatePath("/console");
}

export async function decideCandidateClaim(formData: FormData) {
  const session = await requireRole("EDITOR");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  if (decision !== "PROMOTED" && decision !== "DISMISSED") throw new Error("Invalid decision.");
  await setCandidateClaimStatus(id, decision, session.user.id);
  revalidatePath("/console");
}

const SUBMISSION_DECISIONS = ["ACCEPTED", "REJECTED", "NEEDS_REVISION"] as const;

export async function decideSubmission(formData: FormData) {
  const session = await requireRole("EDITOR");
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  const notes = String(formData.get("notes") ?? "").trim();
  if (!SUBMISSION_DECISIONS.includes(decision as (typeof SUBMISSION_DECISIONS)[number])) throw new Error("Invalid decision.");
  if (!notes) throw new Error("Add a note explaining the decision.");
  await setSubmissionStatus(id, decision as (typeof SUBMISSION_DECISIONS)[number], session.user.id, notes);
  revalidatePath("/console");
}
