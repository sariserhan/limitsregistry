import { NextResponse } from "next/server";
import { reportError } from "../../../src/ops/monitoring";
import { z } from "zod";
import { createEditorialLimit, createEditorialSpec, createEditorialClaim, createEditorialEvidence, recordEditorialReview, listAuditLog, listEditorialQueue, updateClaimEditorialStatus } from "../../../src/db/repository";

const limitSchema = z.object({ action: z.literal("create-limit"), registryNumber: z.string().regex(/^LR-[0-9]{6}$/), slug: z.string().min(2), title: z.string().min(2), summary: z.string().min(10), category: z.string().min(2), direction: z.enum(["MINIMIZE", "MAXIMIZE"]), token: z.string().min(1) });
const specSchema = z.object({ action: z.literal("create-spec"), limitId: z.string().uuid(), formalStatement: z.string().min(10), constraints: z.record(z.string(), z.unknown()), token: z.string().min(1) });
const statusSchema = z.object({ action: z.literal("update-claim"), claimId: z.string().uuid(), status: z.enum(["ACCEPTED", "REJECTED", "UNDER_REVIEW", "DISPUTED", "INVALIDATED"]), token: z.string().min(1) });
function authorized(token: string | null) { return Boolean(process.env.EDITORIAL_ADMIN_TOKEN && token && token === process.env.EDITORIAL_ADMIN_TOKEN); }
export async function GET(request: Request) {
  if (!authorized(request.headers.get("x-editorial-token"))) return NextResponse.json({ items: [], error: "Editorial access requires an admin token." }, { status: 401 });
  try { if (new URL(request.url).searchParams.get("audit") === "1") return NextResponse.json({ items: await listAuditLog() }); return NextResponse.json({ items: await listEditorialQueue(new URL(request.url).searchParams.get("q") ?? "") }); } catch (error) { reportError(error, { requestId: "request-id-middleware", route: "app/api/editorial/route.ts" }); return NextResponse.json({ items: [], error: "Editorial database is unavailable." }, { status: 503 }); }
}
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("action" in body)) return NextResponse.json({ error: "Action is required." }, { status: 400 });
    const action = (body as { action: string }).action;
    const token = (body as { token?: string }).token ?? null;
    if (!authorized(token)) return NextResponse.json({ error: "Editorial access requires a valid admin token." }, { status: 401 });
    if (action === "create-limit") return NextResponse.json(await createEditorialLimit(limitSchema.parse(body)));
    if (action === "create-spec") { const parsed = specSchema.parse(body); return NextResponse.json(await createEditorialSpec(parsed)); }
    if (action === "create-claim") return NextResponse.json(await createEditorialClaim(body as never));
    if (action === "create-evidence") return NextResponse.json(await createEditorialEvidence(body as never));
    if (action === "record-review") return NextResponse.json(await recordEditorialReview(body as never));
    if (action === "audit-log") return NextResponse.json(await listAuditLog());
    if (action === "update-claim") { const parsed = statusSchema.parse(body); return NextResponse.json(await updateClaimEditorialStatus(parsed.claimId, parsed.status)); }
    return NextResponse.json({ error: "Unknown editorial action." }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid input." : "Editorial action failed." }, { status: 400 }); }
}
