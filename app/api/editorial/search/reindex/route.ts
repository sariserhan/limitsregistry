import { NextResponse } from "next/server";
import { getSession } from "../../../../../src/auth/session";
import { canRefreshSearchIndex } from "../../../../../src/search/access";
import { refreshPublicSearchIndex, searchIndexStatus } from "../../../../../src/db/repository.search";
import { reportError } from "../../../../../src/ops/monitoring";
export const runtime = "nodejs"; export const maxDuration = 300; export const dynamic = "force-dynamic";
async function authorize() { const session = await getSession(); return session && canRefreshSearchIndex(session.user.role as never) ? session : null; }
export async function GET() { if (!(await authorize())) return NextResponse.json({ error: "Editor access is required." }, { status: 401 }); try { return NextResponse.json({ data: await searchIndexStatus() }); } catch (error) { reportError(error, { requestId: "search-reindex-status", route: "app/api/editorial/search/reindex/route.ts" }); return NextResponse.json({ error: "Search index status is unavailable." }, { status: 503 }); } }
export async function POST() { if (!(await authorize())) return NextResponse.json({ error: "Editor access is required." }, { status: 401 }); try { return NextResponse.json({ data: await refreshPublicSearchIndex() }); } catch (error) { reportError(error, { requestId: "search-reindex", route: "app/api/editorial/search/reindex/route.ts" }); return NextResponse.json({ error: "Search indexing failed. Failed rows remain visible in index status and can be retried." }, { status: 503 }); } }
