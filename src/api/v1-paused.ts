import { NextResponse } from "next/server";

// Emergency switch. Documentation stays visible while API requests are paused.
// Environment changes require a restart/redeployment.
export const API_V1_PAUSED = process.env.API_V1_PAUSED === "true";

export function pausedApiResponse() {
  return NextResponse.json({ error: "This API is not currently available." }, { status: 404, headers: { "cache-control": "private, no-store" } });
}
