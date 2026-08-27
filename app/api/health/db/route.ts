import { NextResponse } from "next/server";
import { getDatabaseHealth } from "../../../../src/db/repository";

export const runtime = "nodejs";

export async function GET() {
  try { const healthy = await getDatabaseHealth(); return NextResponse.json({ status: healthy ? "ok" : "degraded" }, { status: healthy ? 200 : 503 }); }
  catch { return NextResponse.json({ status: "unavailable" }, { status: 503 }); }
}
