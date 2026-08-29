"use server";

import { redirect } from "next/navigation";
import { requireRole } from "../../../../src/auth/session";
import { submitPersonClaimRequest } from "../../../../src/db/repository.researchers";

function destination(personId: string, message: string, error = false) {
  return `/researchers/${personId}/claim?` + (error ? "error=" : "success=") + encodeURIComponent(message);
}

export async function submitResearcherClaim(formData: FormData) {
  const session = await requireRole("USER");
  const personId = String(formData.get("personId") ?? "");
  const verificationNote = String(formData.get("verificationNote") ?? "").trim();
  if (!personId) redirect("/researchers");
  // redirect() throws internally — calling it for the success path from inside this try would
  // have its own throw caught by the catch below, landing on the error branch every time.
  let target: string;
  try {
    await submitPersonClaimRequest({ personId, requestedByUserId: session.user.id, verificationNote });
    target = destination(personId, "Claim request submitted for editorial review.");
  } catch (error) {
    target = destination(personId, error instanceof Error ? error.message : "Claim request could not be submitted.", true);
  }
  redirect(target);
}
