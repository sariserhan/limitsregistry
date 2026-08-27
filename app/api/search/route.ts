import { NextResponse } from "next/server";
import { z } from "zod";
import { reportError } from "../../../src/ops/monitoring";
import { exactPublicSearch, semanticPublicSearch } from "../../../src/db/repository.search";
const querySchema = z.object({ q: z.string().trim().min(2).max(500), mode: z.enum(["exact", "semantic"]).default("exact"), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: Request) { const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams)); if (!parsed.success) return NextResponse.json({ data: [], error: parsed.error.issues[0]?.message ?? "Invalid search query." }, { status: 400 }); try { const data = parsed.data.mode === "semantic" ? await semanticPublicSearch(parsed.data.q, parsed.data.limit) : await exactPublicSearch(parsed.data.q, parsed.data.limit); return NextResponse.json({ data, meta: { query: parsed.data.q, mode: parsed.data.mode, count: data.length } }); } catch (error) { reportError(error, { requestId: "search-route", route: "app/api/search/route.ts" }); return NextResponse.json({ data: [], error: parsed.data.mode === "semantic" ? "Semantic search is temporarily unavailable. Exact search remains available." : "Search is temporarily unavailable." }, { status: 503 }); } }
