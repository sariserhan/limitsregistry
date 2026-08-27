"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../src/auth/session";
import { subscribeToLimit, unsubscribeFollow, updateFollowPreference, type WatchFrequency } from "../../src/db/repository.watchlists";
const done = (message: string, error = false): never => redirect(`/watchlists?${error ? "error" : "success"}=${encodeURIComponent(message)}`);
const frequency = (formData: FormData): WatchFrequency => String(formData.get("frequency")) === "INSTANT" ? "INSTANT" : "WEEKLY";
export async function subscribeAction(formData: FormData) { const session = await requireRole("USER"); try { await subscribeToLimit({ subscriberKey: session.user.id, email: session.user.email, limitId: String(formData.get("limitId") ?? ""), frequency: frequency(formData) }); revalidatePath("/watchlists"); done("Watchlist subscription saved."); } catch (error) { done(error instanceof Error ? error.message : "Subscription could not be saved.", true); } }
export async function updatePreferenceAction(formData: FormData) { const session = await requireRole("USER"); try { await updateFollowPreference({ id: String(formData.get("id") ?? ""), subscriberKey: session.user.id, frequency: frequency(formData) }); revalidatePath("/watchlists"); done("Email preference updated."); } catch (error) { done(error instanceof Error ? error.message : "Preference could not be updated.", true); } }
export async function unsubscribeAction(formData: FormData) { const session = await requireRole("USER"); try { await unsubscribeFollow({ id: String(formData.get("id") ?? ""), subscriberKey: session.user.id }); revalidatePath("/watchlists"); done("You have unsubscribed from this Limit."); } catch (error) { done(error instanceof Error ? error.message : "Unsubscribe failed.", true); } }
