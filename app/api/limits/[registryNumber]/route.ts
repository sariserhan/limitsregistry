import { NextResponse } from "next/server";
import { reportError } from "../../../../src/ops/monitoring";
import { getPublishedDomainLimit } from "../../../../src/db/repository";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(_: Request, { params }: { params: Promise<{ registryNumber: string }> }) {
  try {
    const { registryNumber } = await params;
    const limit = await getPublishedDomainLimit(registryNumber);
    return limit ? NextResponse.json({ data: limit }, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } }) : NextResponse.json({ error: "Limit not found." }, { status: 404 });
  } catch (error) { reportError(error, { requestId: "request-id-middleware", route: "app/api/limits/[registryNumber]/route.ts" }); return NextResponse.json({ error: "Registry data is temporarily unavailable." }, { status: 503 }); }
}
