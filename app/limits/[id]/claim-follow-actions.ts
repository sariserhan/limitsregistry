"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../../src/auth/session";
import { followClaim } from "../../../src/db/repository.watchlists";

export async function followClaimAction(formData: FormData) {
  const session = await requireRole("USER");
  const claimNumber = String(formData.get("claimNumber") ?? "").trim();
  const registryNumber = String(formData.get("registryNumber") ?? "").trim();
  if (!claimNumber || !registryNumber) throw new Error("Claim and Limit are required.");
  await followClaim({ claimNumber, subscriberKey: session.user.id, email: session.user.email });
  revalidatePath("/limits/" + registryNumber);
}
