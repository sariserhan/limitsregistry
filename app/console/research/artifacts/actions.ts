"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../../src/auth/session";
import { createVerificationArtifact, decideVerificationArtifact, recordVerifierExecution } from "../../../../src/db/repository.research";
import { ARTIFACT_VERIFIERS, type ArtifactVerifier } from "../../../../src/verification/artifact-adapters";
const done = (message: string, error = false): never => redirect(`/console/research/artifacts?${error ? "error" : "success"}=${encodeURIComponent(message)}`);
export async function submitArtifact(formData: FormData) {
  await requireRole("RESEARCHER");
  const claimId = String(formData.get("claimId") ?? ""), verifier = String(formData.get("verifier") ?? "") as ArtifactVerifier, repositoryUrl = String(formData.get("repositoryUrl") ?? "").trim(), commitHash = String(formData.get("commitHash") ?? "").trim(), verifierVersion = String(formData.get("verifierVersion") ?? "").trim();
  if (!claimId || !ARTIFACT_VERIFIERS.includes(verifier)) done("Choose a Claim and supported verifier.", true);
  try { await createVerificationArtifact({ claimId, verifier, repositoryUrl, commitHash, verifierVersion }); revalidatePath("/console/research/artifacts"); done("Artifact submitted for review."); } catch (error) { done(error instanceof Error ? error.message : "Artifact could not be submitted.", true); }
}
export async function reviewArtifact(formData: FormData) {
  const session = await requireRole("REVIEWER");
  const id = String(formData.get("id") ?? ""), decision = String(formData.get("decision") ?? ""), rationale = String(formData.get("rationale") ?? "");
  if (!id || !["ACCEPTED", "REJECTED"].includes(decision)) done("Invalid artifact decision.", true);
  try { await decideVerificationArtifact({ id, decision: decision as "ACCEPTED" | "REJECTED", rationale, actorUserId: session.user.id }); revalidatePath("/console/research/artifacts"); done(`Artifact ${decision.toLowerCase()}.`); } catch (error) { done(error instanceof Error ? error.message : "Review could not be saved.", true); }
}
export async function recordExecution(formData: FormData) {
  const session = await requireRole("EDITOR");
  const artifactId = String(formData.get("artifactId") ?? ""), command = String(formData.get("command") ?? ""), toolVersion = String(formData.get("toolVersion") ?? ""), exitCode = Number(formData.get("exitCode")), stdout = String(formData.get("stdout") ?? ""), stderr = String(formData.get("stderr") ?? "");
  if (!artifactId || !Number.isInteger(exitCode)) done("Artifact and integer exit code are required.", true);
  try { const result = await recordVerifierExecution({ artifactId, command, toolVersion, exitCode, stdout, stderr, actorUserId: session.user.id }); revalidatePath("/console/research/artifacts"); revalidatePath("/limits", "layout"); done(result.artifact.verificationLevel === "MACHINE_CHECKED" ? "Reproducible build recorded. MACHINE_CHECKED issued." : "Verifier execution recorded without a machine-checked badge."); } catch (error) { done(error instanceof Error ? error.message : "Execution could not be recorded.", true); }
}
