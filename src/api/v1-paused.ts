import { NextResponse } from "next/server";

// The public /api/v1 endpoints and /developers docs are parked, not removed — a monetization
// path (paid tier for bulk/commercial API access) is still being decided, and giving the whole
// thing away free in the meantime undercuts that. Flip PAUSED back to false to re-enable; no
// other code changes needed.
export const API_V1_PAUSED = true;

export function pausedApiResponse() {
  return NextResponse.json({ error: "This API is not currently available." }, { status: 404 });
}
