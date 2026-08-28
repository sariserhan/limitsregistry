"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../../src/auth/session";
import { hasRole, type Role } from "../../../src/auth/permissions";
import { decideEditorialApplication, type EditorialApplicationDecision } from "../../../src/db/repository.applications";

export async function decideApplication(formData: FormData) {
  const session = await requireRole("EDITOR");
  const applicationType = String(formData.get("applicationType") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (applicationType !== "REVIEWER" && applicationType !== "EDITOR") throw new Error("Invalid application type.");
  if (decision !== "APPROVED" && decision !== "REJECTED") throw new Error("Invalid decision.");
  if (applicationType === "EDITOR" && !hasRole(session.user.role as Role, "ADMIN")) throw new Error("Only an admin can approve editor access.");
  await decideEditorialApplication({ id: String(formData.get("applicationId") ?? ""), decision: decision as EditorialApplicationDecision, reviewerUserId: session.user.id, reviewNotes: String(formData.get("reviewNotes") ?? "") });
  revalidatePath("/admin/applications");
  revalidatePath("/console/applications");
  revalidatePath("/account/apply");
  revalidatePath("/admin");
}
