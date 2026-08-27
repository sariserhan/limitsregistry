"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../src/auth/session";
import { createBounty } from "../../../src/db/repository.research";

const done = (message: string, error = false): never => redirect(`/console/research?${error ? "error" : "success"}=${encodeURIComponent(message)}`);

export async function submitBounty(formData: FormData) {
  await requireRole("RESEARCHER");
  const limitId = String(formData.get("limitId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const sponsor = String(formData.get("sponsor") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  if (!title || !sponsor || !description || !sourceUrl) done("Title, sponsor, description, and source URL are required.", true);
  // done() on the success path must run OUTSIDE the try — it calls redirect(), which throws by
  // design, and a redirect thrown from inside a try is caught by its own catch and misreported
  // as an error (the thrown error's .message is literally "NEXT_REDIRECT").
  try {
    await createBounty({ limitId: limitId || null, title, sponsor, description, sourceUrl, amount: amount || null, currency: currency || null });
    revalidatePath("/console/research");
  } catch (error) {
    done(error instanceof Error ? error.message : "Bounty could not be submitted.", true);
  }
  done("Bounty submitted.");
}
