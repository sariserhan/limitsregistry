"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../../src/auth/session";
import { createVerificationArtifact, decideVerificationArtifact, recordVerifierExecution } from "../../../../src/db/repository.research";
import { ARTIFACT_VERIFIERS, type ArtifactVerifier } from "../../../../src/verification/artifact-adapters";
const done = (message: string, error = false): never => redirect(`/console/research/artifacts?${error ? "error" : "success"}=${encodeURIComponent(message)}`);
// done() on a success path must always run OUTSIDE its try — it calls redirect(), which throws
// by design, and a redirect thrown from inside a try is caught by its own catch and misreported
// as an error (the thrown error's .message is literally "NEXT_REDIRECT").
export async function submitArtifact(formData: FormData) {
  await requireRole("RESEARCHER");
  const claimId = String(formData.get("claimId") ?? ""), verifier = String(formData.get("verifier") ?? "") as ArtifactVerifier, repositoryUrl = String(formData.get("repositoryUrl") ?? "").trim(), commitHash = String(formData.get("commitHash") ?? "").trim(), verifierVersion = String(formData.get("verifierVersion") ?? "").trim();
  if (!claimId || !ARTIFACT_VERIFIERS.includes(verifier)) done("Choose a Claim and supported verifier.", true);
  try { await createVerificationArtifact({ claimId, verifier, repositoryUrl, commitHash, verifierVersion }); revalidatePath("/console/research/artifacts"); } catch (error) { done(error instanceof Error ? error.message : "Artifact could not be submitted.", true); }
  done("Artifact submitted for review.");
}
export async function reviewArtifact(formData: FormData) {
  const session = await requireRole("REVIEWER");
  const id = String(formData.get("id") ?? ""), decision = String(formData.get("decision") ?? ""), rationale = String(formData.get("rationale") ?? "");
  if (!id || !["ACCEPTED", "REJECTED"].includes(decision)) done("Invalid artifact decision.", true);
  try { await decideVerificationArtifact({ id, decision: decision as "ACCEPTED" | "REJECTED", rationale, actorUserId: session.user.id }); revalidatePath("/console/research/artifacts"); } catch (error) { done(error instanceof Error ? error.message : "Review could not be saved.", true); }
  done(`Artifact ${decision.toLowerCase()}.`);
}
export async function recordExecution(formData: FormData) {
  const session = await requireRole("EDITOR");
  const artifactId = String(formData.get("artifactId") ?? ""), command = String(formData.get("command") ?? ""), toolVersion = String(formData.get("toolVersion") ?? ""), exitCode = Number(formData.get("exitCode")), stdout = String(formData.get("stdout") ?? ""), stderr = String(formData.get("stderr") ?? "");
  if (!artifactId || !Number.isInteger(exitCode)) done("Artifact and integer exit code are required.", true);
  let successMessage = "Verifier execution recorded without a machine-checked badge.";
  try { const result = await recordVerifierExecution({ artifactId, command, toolVersion, exitCode, stdout, stderr, actorUserId: session.user.id }); revalidatePath("/console/research/artifacts"); revalidatePath("/limits", "layout"); successMessage = result.artifact.verificationLevel === "MACHINE_CHECKED" ? "Reproducible build recorded. MACHINE_CHECKED issued." : successMessage; } catch (error) { done(error instanceof Error ? error.message : "Execution could not be recorded.", true); }
  done(successMessage);
}
