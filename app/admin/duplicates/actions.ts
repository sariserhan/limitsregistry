"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../../src/auth/session";
import { retireDuplicateLimit } from "../../../src/db/repository.registry-tools";

export async function retireDuplicateAction(formData: FormData) {
  const session = await requireRole("ADMIN");
  await retireDuplicateLimit({ duplicateId: String(formData.get("duplicateId") ?? ""), keptId: String(formData.get("keptId") ?? ""), actorUserId: session.user.id, rationale: String(formData.get("rationale") ?? "") });
  revalidatePath("/admin/duplicates");
  revalidatePath("/");
}
