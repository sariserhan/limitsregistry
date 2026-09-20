import { viewRequestSchema } from "../../../src/domain/public-views";
import { recordPublicView } from "../../../src/db/repository.public-views";
import { allowRequest } from "../../../src/ops/rate-limit";
import { clientIp } from "../../../src/ops/client-ip";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid origin." }, { status: 403, headers });
  if (Number(request.headers.get("content-length")) > 2048) return Response.json({ error: "Request too large." }, { status: 413, headers });
  let body;
  try { const text = await request.text(); if (text.length > 2048) return Response.json({ error: "Request too large." }, { status: 413, headers }); body = JSON.parse(text); }
  catch { return Response.json({ error: "Invalid request." }, { status: 400, headers }); }
  const input = viewRequestSchema.safeParse(body);
  if (!input.success) return Response.json({ error: "Invalid view target." }, { status: 400, headers });
  try {
    if (!(await allowRequest(`public-views:${clientIp(request)}`, 120, 60_000))) return Response.json({ error: "Too many requests." }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
    const count = await recordPublicView(input.data);
    return count ? Response.json(count, { headers }) : Response.json({ error: "Not found." }, { status: 404, headers });
  } catch { return Response.json({ error: "View statistics unavailable." }, { status: 503, headers }); }
}
