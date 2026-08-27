import { NextResponse } from "next/server";
import { listPublishedDomainLimits } from "../../../src/db/repository";

export const runtime = "nodejs";

export async function GET() {
  try { return NextResponse.json({ data: await listPublishedDomainLimits() }); }
  catch { return NextResponse.json({ error: "Registry data is temporarily unavailable." }, { status: 503 }); }
}
