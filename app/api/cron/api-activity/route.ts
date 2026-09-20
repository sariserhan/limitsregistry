import { timingSafeEqual } from "node:crypto";
import { sendApiActivityAlert } from "../../../../src/api/activity-alerts";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`);
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  if (!process.env.CRON_SECRET || expected.length !== provided.length || !timingSafeEqual(expected, provided)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { return Response.json(await sendApiActivityAlert(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "API alert processing failed." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
