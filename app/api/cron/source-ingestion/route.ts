import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processSourceIngestionBatch } from "../../../../src/lib/ingestion/worker";
export const runtime = "nodejs";
export const maxDuration = 60;
function authorized(request: Request) { const expected=process.env.CRON_SECRET; const value=request.headers.get("authorization")??""; const provided=value.startsWith("Bearer ")?value.slice(7):""; return Boolean(expected&&provided&&provided.length===expected.length&&timingSafeEqual(Buffer.from(provided),Buffer.from(expected))); }
export async function GET(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});const results=await processSourceIngestionBatch(2);return NextResponse.json({processed:results.length,results});}
export const POST=GET;
