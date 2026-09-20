import { timingSafeEqual } from "node:crypto";
import { prunePublicViewReceipts } from "../../../../src/db/repository.public-views";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`), provided = Buffer.from(request.headers.get("authorization") ?? "");
  if (!process.env.CRON_SECRET || expected.length !== provided.length || !timingSafeEqual(expected, provided)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { await prunePublicViewReceipts(); return Response.json({ cleaned: true }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Receipt cleanup failed." }, { status: 503 }); }
}
