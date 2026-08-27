import { NextResponse } from "next/server";
import { getPublishedDomainLimit } from "../../../../src/db/repository";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ registryNumber: string }> }) {
  try {
    const { registryNumber } = await params;
    const limit = await getPublishedDomainLimit(registryNumber);
    return limit ? NextResponse.json({ data: limit }) : NextResponse.json({ error: "Limit not found." }, { status: 404 });
  } catch { return NextResponse.json({ error: "Registry data is temporarily unavailable." }, { status: 503 }); }
}
