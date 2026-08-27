"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../src/auth/session";
import { upsertReviewerProfile } from "../../src/db/repository.reviewers";

export async function saveReviewerProfile(formData: FormData) {
  const session = await requireRole("REVIEWER");
  const fieldsOfExpertise = String(formData.get("fieldsOfExpertise") ?? "").split(",").map((f) => f.trim()).filter(Boolean);
  const credentials = String(formData.get("credentials") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  await upsertReviewerProfile(session.user.id, fieldsOfExpertise, credentials, bio);
  revalidatePath("/reviewer-profile");
}
