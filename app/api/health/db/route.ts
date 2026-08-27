import { NextResponse } from "next/server";
import { reportError } from "../../../../src/ops/monitoring";
import { getDatabaseHealth } from "../../../../src/db/repository";

export const runtime = "nodejs";

export async function GET() {
  try { const healthy = await getDatabaseHealth(); return NextResponse.json({ status: healthy ? "ok" : "degraded" }, { status: healthy ? 200 : 503 }); }
  catch (error) { reportError(error, { requestId: "request-id-middleware", route: "app/api/health/db/route.ts" }); return NextResponse.json({ status: "unavailable" }, { status: 503 }); }
}
