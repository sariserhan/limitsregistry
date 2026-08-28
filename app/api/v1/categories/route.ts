import { NextResponse } from "next/server";
import { listPublicCategories } from "../../../../src/db/repository";
import { API_V1_PAUSED, pausedApiResponse } from "../../../../src/api/v1-paused";

export const runtime = "nodejs";

export async function GET() {
  if (API_V1_PAUSED) return pausedApiResponse();
  const data = await listPublicCategories();
  return NextResponse.json({ data }, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
