"use server";
import { redirect } from "next/navigation";
import { unsubscribeWithToken } from "../../../src/db/repository.watchlists";
export async function confirmEmailUnsubscribe(formData: FormData) { try { await unsubscribeWithToken({ id: String(formData.get("follow") ?? ""), token: String(formData.get("token") ?? "") }); redirect("/watchlists/unsubscribe?done=1"); } catch { redirect("/watchlists/unsubscribe?error=1"); } }
