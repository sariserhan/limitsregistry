import { NextResponse } from "next/server";
import { requireRole } from "../../../../src/auth/session";
import { db } from "../../../../src/db/client";
import { reproductions } from "../../../../src/db/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireRole("RESEARCHER");
  const body = await request.json() as { claimId?: string; evidenceId?: string; method?: string; result?: string; artifactUrl?: string };
  if (!body.claimId || !body.method || !body.result) return NextResponse.json({ error: "claimId, method, and result are required." }, { status: 400 });
  if (body.artifactUrl && !/^https:\/\//i.test(body.artifactUrl)) return NextResponse.json({ error: "artifactUrl must use HTTPS." }, { status: 400 });
  const [row] = await db.insert(reproductions).values({ claimId: body.claimId, evidenceId: body.evidenceId || null, method: body.method.slice(0, 500), result: body.result.slice(0, 5000), artifactUrl: body.artifactUrl || null }).returning();
  return NextResponse.json({ data: row, submittedBy: session.user.id }, { status: 201 });
}
