import { NextResponse } from "next/server";
import { recordAcquisitionEvent } from "../../../src/db/repository.analytics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await recordAcquisitionEvent({ eventName: String(body.eventName ?? ""), path: String(body.path ?? ""), referrer: typeof body.referrer === "string" ? body.referrer : null });
    return NextResponse.json({ ok: Boolean(result) }, { status: result ? 201 : 400 });
  } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
}
