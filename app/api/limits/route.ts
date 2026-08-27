import { NextResponse } from "next/server";
import { reportError } from "../../../src/ops/monitoring";
import { listPublishedDomainLimits } from "../../../src/db/repository";

export const runtime = "nodejs";

export async function GET() {
  try { return NextResponse.json({ data: await listPublishedDomainLimits() }); }
  catch (error) { reportError(error, { requestId: "request-id-middleware", route: "app/api/limits/route.ts" }); return NextResponse.json({ error: "Registry data is temporarily unavailable." }, { status: 503 }); }
}
