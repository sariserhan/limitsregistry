import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) { const response = NextResponse.next(); response.headers.set("x-request-id", request.headers.get("x-request-id") ?? crypto.randomUUID()); return response; }
export const config = { matcher: ["/api/:path*"] };
