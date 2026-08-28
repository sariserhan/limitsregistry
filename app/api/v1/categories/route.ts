import { NextResponse } from "next/server";
import { listPublicCategories } from "../../../../src/db/repository";

export const runtime = "nodejs";

export async function GET() {
  const data = await listPublicCategories();
  return NextResponse.json({ data }, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
