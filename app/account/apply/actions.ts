"use server";

import { redirect } from "next/navigation";
import { requireRole } from "../../../src/auth/session";
import { createEditorialApplication, type EditorialApplicationType } from "../../../src/db/repository.applications";

function destination(message: string, error = false) {
  return "/account/apply?" + (error ? "error=" : "success=") + encodeURIComponent(message);
}

export async function submitEditorialApplication(formData: FormData) {
  const session = await requireRole("USER");
  const applicationType = String(formData.get("applicationType") ?? "");
  if (applicationType !== "REVIEWER" && applicationType !== "EDITOR") redirect(destination("Choose Reviewer or Editor access.", true));
  const fields = String(formData.get("fieldsOfExpertise") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const credentials = String(formData.get("credentials") ?? "").trim();
  const motivation = String(formData.get("motivation") ?? "").trim();
  if (!affiliation || !credentials || !motivation || fields.length === 0) redirect(destination("Affiliation, expertise, credentials, and motivation are required.", true));
  if (formData.get("conflictDisclosure") !== "on") redirect(destination("You must disclose conflicts of interest before applying.", true));
  try {
    await createEditorialApplication({
      applicantUserId: session.user.id,
      applicationType: applicationType as EditorialApplicationType,
      affiliation,
      orcid: String(formData.get("orcid") ?? "").trim() || undefined,
      website: String(formData.get("website") ?? "").trim() || undefined,
      fieldsOfExpertise: fields,
      credentials,
      motivation,
      conflictDisclosure: true,
    });
    redirect(destination("Application submitted for editorial review."));
  } catch (error) {
    redirect(destination(error instanceof Error ? error.message : "Application could not be submitted.", true));
  }
}
