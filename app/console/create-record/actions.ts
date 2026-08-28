"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../src/auth/session";
import { createRecordDraft } from "../../../src/db/repository";

const done = (message: string, error = false): never => redirect(`/console/create-record?${error ? "error" : "success"}=${encodeURIComponent(message)}`);

// done() on the success path must run OUTSIDE the try — it calls redirect(), which throws by
// design, and a redirect thrown from inside a try is caught by its own catch and misreported
// as an error (the thrown error's .message is literally "NEXT_REDIRECT"). Mirrors
// app/console/research/bounties/actions.ts.
export async function createRecord(formData: FormData) {
  const session = await requireRole("EDITOR");
  const category = String(formData.get("newCategory") ?? "").trim() || String(formData.get("category") ?? "").trim();
  if (!category) done("Choose an existing field or type a new one.", true);
  const boundType = String(formData.get("boundType") ?? "");
  if (boundType !== "UPPER_BOUND" && boundType !== "LOWER_BOUND") done("Choose upper or lower bound.", true);

  let registryNumber = "";
  try {
    const record = await createRecordDraft({
      title: String(formData.get("title") ?? ""),
      category,
      summary: String(formData.get("summary") ?? ""),
      formalStatement: String(formData.get("abstract") ?? ""),
      metricName: String(formData.get("metricName") ?? ""),
      unit: String(formData.get("unit") ?? "") || undefined,
      boundType: boundType as "UPPER_BOUND" | "LOWER_BOUND",
      valueExact: String(formData.get("valueExact") ?? ""),
      evidenceUrl: String(formData.get("evidenceUrl") ?? "") || undefined,
      createdByUserId: session.user.id,
    });
    registryNumber = record.limit.registryNumber;
  } catch (error) {
    done(error instanceof Error ? error.message : "Record could not be created.", true);
  }
  revalidatePath("/console/create-record");
  done(`Draft ${registryNumber} created. It still needs editorial review (evidence + two independent accepted reviews) before it can be published.`);
}
