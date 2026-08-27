import { NextResponse } from "next/server";
import { listPublishedLimits } from "../../../src/db/repository";

export const runtime = "nodejs";

export async function GET() {
  try { return NextResponse.json({ data: await listPublishedLimits() }); }
  catch { return NextResponse.json({ error: "Registry data is temporarily unavailable." }, { status: 503 }); }
}
