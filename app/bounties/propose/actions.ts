"use server";
import { redirect } from "next/navigation";
import { requireRole } from "../../../src/auth/session";
import { createBounty } from "../../../src/db/repository.research";
const done = (message: string, error = false): never => redirect("/bounties/propose?" + (error ? "error=" : "success=") + encodeURIComponent(message));
export async function submitPrizePoolProposal(formData: FormData) {
  const session = await requireRole("USER");
  const amount = String(formData.get("amount") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  if (!amount || !currency) done("Prize pool amount and currency are required.", true);
  if (formData.get("reviewAcknowledgement") !== "on") done("Acknowledge the two-stage review before submitting.", true);
  try {
    await createBounty({ limitId: String(formData.get("limitId") ?? ""), title: String(formData.get("title") ?? ""), sponsor: String(formData.get("sponsor") ?? ""), description: String(formData.get("description") ?? ""), sourceUrl: String(formData.get("sourceUrl") ?? ""), amount, currency, expiresAt: String(formData.get("expiresAt") ?? "") ? new Date(String(formData.get("expiresAt")) + "T23:59:59Z") : null, submittedByUserId: session.user.id });
  } catch (error) { done(error instanceof Error ? error.message : "Prize pool proposal could not be submitted.", true); }
  done("Prize pool proposal sent to Admin and Editorial review.");
}
