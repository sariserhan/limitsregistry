"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createInboxMessage } from "../../src/db/repository.inbox";
import { allowRequest } from "../../src/ops/rate-limit";

// The client controls every hop it prepends to x-forwarded-for, but not the one the nearest
// reverse proxy (Vercel's edge) appends — that's the last entry in the list. Same helper as
// app/api/export/route.ts, duplicated here since Server Actions don't receive a Request object.
async function clientIp() {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",").pop()?.trim() || "unknown";
}

// Returns { error } for expected validation/rate-limit failures instead of throwing — a plain
// throw from a Server Action has no local error boundary here, so it was propagating all the way
// up to the root error.tsx and replacing the whole page (losing whatever the visitor had typed)
// for something as ordinary as a malformed email or a client-side check they bypassed.
export async function submitInboxMessage(_prevState: { error: string } | undefined, formData: FormData): Promise<{ error: string } | undefined> {
  const channel = String(formData.get("channel") ?? "");
  if (channel !== "CONTACT" && channel !== "SUPPORT") return { error: "Invalid channel." };

  const ip = await clientIp();
  // 5 messages/hour/IP — an unauthenticated public form is a spam surface, same posture as
  // app/submit/actions.ts's 5/hour/user limit on authenticated submissions.
  if (!(await allowRequest(`inbox:${channel}:${ip}`, 5, 60 * 60 * 1000))) return { error: "Too many messages sent recently. Try again in a while." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2) return { error: "Name is too short." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (message.length < 10) return { error: "Message is too short." };

  await createInboxMessage({ channel, name, email, subject: subject || undefined, message });
  redirect(channel === "SUPPORT" ? "/support?sent=1" : "/contact?sent=1");
}
