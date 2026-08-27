import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getWeeklyDigestData, listDigestRecipients } from "../../../../src/db/repository.digest";
import { sendWeeklyDigestEmail } from "../../../../src/lib/email/digest-email";

// Same constant-time comparison pattern as app/api/editorial/route.ts — a plain
// `!==` on a bearer secret leaks timing information byte-by-byte.
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getWeeklyDigestData();
  const recipients = await listDigestRecipients();
  await Promise.all(recipients.map((r) => sendWeeklyDigestEmail(r.email, r.name, data)));

  return NextResponse.json({ sent: recipients.length, newlyPublished: data.newlyPublished.length, acceptedClaims: data.acceptedClaims.length, newSubmissions: data.newSubmissions.length });
}
