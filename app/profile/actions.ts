"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../src/auth/session";
import { updateUserProfile } from "../../src/db/repository.profile";

function safeProfileUrl(raw: string) {
  if (!raw) return null;
  try { const url = new URL(raw); if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(); return url.toString(); } catch { throw new Error("Website must be a valid http(s) URL."); }
}

export async function saveProfile(formData: FormData) {
  const session = await requireRole("USER");
  const name = String(formData.get("name") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim() || null;
  const orcid = String(formData.get("orcid") ?? "").trim() || null;
  const website = safeProfileUrl(String(formData.get("website") ?? "").trim());
  if (name.length < 2 || name.length > 120) throw new Error("Name must be between 2 and 120 characters.");
  if (orcid && !/^https?:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/i.test(orcid)) throw new Error("ORCID must look like https://orcid.org/0000-0000-0000-0000.");
  await updateUserProfile(session.user.id, { name, affiliation: affiliation?.slice(0, 180) ?? null, orcid, website });
  revalidatePath("/profile");
  revalidatePath("/submit");
}
