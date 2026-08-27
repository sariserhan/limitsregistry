import { after, NextResponse } from "next/server";
import { reportError } from "../../../src/ops/monitoring";
import { z } from "zod";
import { getSession } from "../../../src/auth/session";
import { hasRole } from "../../../src/auth/permissions";
import { deliverWatchlistNotifications } from "../../../src/watchlists/delivery";
import { createEditorialLimit, createEditorialSpec, createEditorialClaim, createEditorialEvidence, recordEditorialReview, issueClaimCertificate, listAuditLog, listEditorialQueue, updateClaimEditorialStatus } from "../../../src/db/repository";

const limitSchema = z.object({ action: z.literal("create-limit"), registryNumber: z.string().regex(/^LR-[0-9]{6}$/), slug: z.string().min(2), title: z.string().min(2), summary: z.string().min(10), category: z.string().min(2), direction: z.enum(["MINIMIZE", "MAXIMIZE"]) });
// The "Constraints" field in editorial-workspace.tsx is a single text input (placeholder
// "domain=finite"), not a JSON object — it sends a comma-separated key=value string. Parse
// that into a record instead of requiring an object, which every submission failed against.
function parseConstraints(raw: string): Record<string, string> {
  const constraints: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [key, ...rest] = pair.split("=");
    const trimmedKey = key?.trim();
    if (!trimmedKey || rest.length === 0) continue;
    constraints[trimmedKey] = rest.join("=").trim();
  }
  return constraints;
}
const specSchema = z.object({ action: z.literal("create-spec"), limitId: z.string().uuid(), formalStatement: z.string().min(10), constraints: z.string().min(1).transform(parseConstraints) });
const statusSchema = z.object({ action: z.literal("update-claim"), claimId: z.string().uuid(), status: z.enum(["ACCEPTED", "REJECTED", "UNDER_REVIEW", "DISPUTED", "INVALIDATED"]) });
const reviewSchema = z.object({ action: z.literal("record-review"), claimId: z.string().uuid(), decision: z.enum(["ACCEPTED", "REJECTED", "NEEDS_REVISION"]), rationale: z.string().min(10), conflictDisclosed: z.boolean().default(true) });

// Real auth, gated by role rather than a shared secret pasted into the browser — this route
// was still on a legacy EDITORIAL_ADMIN_TOKEN bearer check even after the rest of the app
// moved to Better Auth sessions, which meant one leaked token granted editorial write access
// to anyone, forever, with no per-user attribution.
async function authorizedSession() {
  const session = await getSession();
  if (!session || !hasRole(session.user.role as never, "EDITOR")) return null;
  return session;
}
export async function GET(request: Request) {
  if (!(await authorizedSession())) return NextResponse.json({ items: [], error: "Editorial access requires an editor session." }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    if (params.get("audit") === "1") return NextResponse.json({ items: await listAuditLog() });
    return NextResponse.json({ items: await listEditorialQueue(params.get("q") ?? "") });
  } catch (error) { reportError(error, { requestId: "request-id-middleware", route: "app/api/editorial/route.ts" }); return NextResponse.json({ items: [], error: "Editorial database is unavailable." }, { status: 503 }); }
}
export async function POST(request: Request) {
  try {
    const session = await authorizedSession();
    if (!session) return NextResponse.json({ error: "Editorial access requires an editor session." }, { status: 401 });
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("action" in body)) return NextResponse.json({ error: "Action is required." }, { status: 400 });
    const action = (body as { action: string }).action;
    if (action === "create-limit") return NextResponse.json(await createEditorialLimit(limitSchema.parse(body)));
    if (action === "create-spec") { const parsed = specSchema.parse(body); return NextResponse.json(await createEditorialSpec(parsed)); }
    if (action === "create-claim") return NextResponse.json(await createEditorialClaim(body as never));
    if (action === "create-evidence") return NextResponse.json(await createEditorialEvidence(body as never));
    // reviewerUserId used to come from a free-text field the caller typed in — trusting client
    // input for who's reviewing let anyone attribute a decision to any user ID. Now that this
    // route requires a real session, the reviewer is always whoever is actually authenticated.
    if (action === "record-review") { const parsed = reviewSchema.parse(body); return NextResponse.json(await recordEditorialReview({ ...parsed, reviewerUserId: session.user.id })); }
    if (action === "audit-log") return NextResponse.json(await listAuditLog());
    if (action === "issue-certificate") { const bodyData = body as { claimId?: string; certificateType?: "CLAIM_ACCEPTED" | "RECORD_ESTABLISHED" }; if (!bodyData.claimId || !bodyData.certificateType) return NextResponse.json({ error: "claimId and certificateType are required." }, { status: 400 }); return NextResponse.json(await issueClaimCertificate({ claimId: bodyData.claimId, certificateType: bodyData.certificateType, issuedByUserId: session.user.id })); }
    if (action === "update-claim") { const parsed = statusSchema.parse(body); const result = await updateClaimEditorialStatus(parsed.claimId, parsed.status, session.user.id); if (parsed.status === "ACCEPTED") after(() => deliverWatchlistNotifications("INSTANT").catch(() => undefined)); return NextResponse.json(result); }
    return NextResponse.json({ error: "Unknown editorial action." }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid input." : "Editorial action failed." }, { status: 400 }); }
}
