"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../src/auth/session";
import { replyToInboxMessage } from "../../src/db/repository.inbox";

export async function replyToMessage(formData: FormData) {
  const session = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const replyBody = String(formData.get("replyBody") ?? "").trim();
  const returnPath = String(formData.get("returnPath") ?? "/admin/support");
  if (replyBody.length < 5) throw new Error("Reply is too short.");
  await replyToInboxMessage(id, replyBody, session.user.id);
  revalidatePath(returnPath);
}
