"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../../src/auth/session";
import { createDependency, decideDependency } from "../../../../src/db/repository.research";
import { DEPENDENCY_RELATIONS, type DependencyRelation } from "../../../../src/domain/dependencies";

const done = (message: string, error = false): never => redirect(`/console/research/graph?${error ? "error" : "success"}=${encodeURIComponent(message)}`);
export async function submitDependency(formData: FormData) {
  await requireRole("RESEARCHER");
  const sourceLimitId = String(formData.get("sourceLimitId") ?? ""), targetLimitId = String(formData.get("targetLimitId") ?? ""), relation = String(formData.get("relation") ?? "") as DependencyRelation, evidenceClaimId = String(formData.get("evidenceClaimId") ?? "").trim();
  if (!sourceLimitId || !targetLimitId || !DEPENDENCY_RELATIONS.includes(relation)) done("Choose a source, target, and valid relation.", true);
  // done() on the success path must run OUTSIDE the try — it calls redirect(), which throws by
  // design, and a redirect thrown from inside a try is caught by its own catch and misreported
  // as an error (the thrown error's .message is literally "NEXT_REDIRECT").
  try { await createDependency({ sourceLimitId, targetLimitId, relation, evidenceClaimId: evidenceClaimId || null }); revalidatePath("/console/research/graph"); } catch (error) { done(error instanceof Error ? error.message : "Dependency could not be submitted.", true); }
  done("Dependency submitted for editorial review.");
}
export async function reviewDependency(formData: FormData) {
  const session = await requireRole("EDITOR");
  const id = String(formData.get("id") ?? ""), decision = String(formData.get("decision") ?? "");
  if (!id || !["ACCEPTED", "REJECTED"].includes(decision)) done("Invalid editorial decision.", true);
  try { await decideDependency({ id, decision: decision as "ACCEPTED" | "REJECTED", actorUserId: session.user.id }); revalidatePath("/console/research/graph"); revalidatePath("/dependencies"); } catch (error) { done(error instanceof Error ? error.message : "Decision could not be saved.", true); }
  done(`Dependency ${decision.toLowerCase()}.`);
}
