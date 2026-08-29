"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../../src/auth/session";
import { reviewPersonClaimRequest } from "../../../src/db/repository.researchers";

export async function decidePersonClaim(formData: FormData) {
  const session = await requireRole("EDITOR");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "APPROVED" && decision !== "REJECTED") throw new Error("Invalid decision.");
  const personId = String(formData.get("personId") ?? "");
  await reviewPersonClaimRequest({ id: String(formData.get("requestId") ?? ""), decision, reviewerUserId: session.user.id, reviewNotes: String(formData.get("reviewNotes") ?? "") });
  revalidatePath("/console/person-claims");
  if (personId) revalidatePath(`/researchers/${personId}`);
}
