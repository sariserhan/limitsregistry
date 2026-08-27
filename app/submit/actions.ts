"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../src/auth/session";
import { allowRequest } from "../../src/ops/rate-limit";
import { insertSubmission, type NewSubmission } from "../../src/db/repository.submissions";

const SUBMISSION_TYPES = ["BETTER_ACHIEVABLE_RESULT", "STRONGER_BOUND", "PROOF", "REPRODUCTION", "CORRECTION"] as const;
const RELATIONS = ["<", "<=", "=", ">=", ">"] as const;

// `type="url"` is a client-side hint only — a direct POST can send anything, including a
// javascript: URL that would execute in the reviewing editor's session when clicked.
function safeEvidenceUrl(raw: string): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("unsupported protocol");
    return url.toString();
  } catch {
    throw new Error("Evidence URL must be a valid http(s) link.");
  }
}

export async function createSubmission(formData: FormData) {
  const session = await requireRole("USER");

  // 5 submissions/hour/user — public submissions are a spam surface even when authenticated.
  if (!allowRequest(`submit:${session.user.id}`, 5, 60 * 60 * 1000)) throw new Error("You've submitted too many proposals recently. Try again in a while.");

  const limitId = String(formData.get("limitId") ?? "");
  const submissionType = String(formData.get("submissionType") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const proposedRelation = String(formData.get("proposedRelation") ?? "");
  const proposedValueExact = String(formData.get("proposedValueExact") ?? "").trim();
  const evidenceUrl = String(formData.get("evidenceUrl") ?? "").trim();

  if (!limitId) throw new Error("Choose a Limit.");
  if (!SUBMISSION_TYPES.includes(submissionType as (typeof SUBMISSION_TYPES)[number])) throw new Error("Invalid submission type.");
  if (title.length < 4) throw new Error("Title is too short.");
  if (description.length < 10) throw new Error("Description is too short.");

  const input: NewSubmission = {
    submitterUserId: session.user.id,
    limitId,
    submissionType: submissionType as NewSubmission["submissionType"],
    title,
    description,
    evidenceUrl: safeEvidenceUrl(evidenceUrl),
  };
  if (proposedRelation && RELATIONS.includes(proposedRelation as (typeof RELATIONS)[number]) && proposedValueExact) {
    input.proposedRelation = proposedRelation as NewSubmission["proposedRelation"];
    input.proposedValueExact = proposedValueExact;
  }

  await insertSubmission(input);
  revalidatePath("/submit");
}
