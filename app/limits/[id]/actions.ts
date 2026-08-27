"use server";
import { redirect } from "next/navigation";
import { subscribeToLimit } from "../../../src/db/repository.follows";

export async function subscribeToWatchlist(formData: FormData) {
  const limitId = String(formData.get("limitId") ?? "");
  const registryNumber = String(formData.get("registryNumber") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const target = `/limits/${registryNumber}`;
  if (!limitId || !email) redirect(`${target}?watch=error`);
  try {
    await subscribeToLimit(limitId, email);
  } catch {
    redirect(`${target}?watch=error`);
  }
  redirect(`${target}?watch=success#watch`);
}
