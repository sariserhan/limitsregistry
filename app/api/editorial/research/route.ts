import { NextResponse } from "next/server";
import { requireRole } from "../../../../src/auth/session";
import { createBounty, createDependency, createVerificationArtifact } from "../../../../src/db/repository.research";
import { DEPENDENCY_RELATIONS, type DependencyRelation } from "../../../../src/domain/dependencies";
import { ARTIFACT_VERIFIERS, type ArtifactVerifier } from "../../../../src/verification/artifact-adapters";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const session = await requireRole("RESEARCHER");
  const body = await request.json() as Record<string, string>;
  const kind = body.kind;
  if (kind === "artifact") {
    if (!body.claimId || !body.verifier || !body.repositoryUrl || !body.commitHash) return NextResponse.json({ error: "claimId, verifier, repositoryUrl, and commitHash are required." }, { status: 400 });
    if (!ARTIFACT_VERIFIERS.includes(body.verifier as ArtifactVerifier)) return NextResponse.json({ error: "Unsupported verifier." }, { status: 400 });
    try { const row = await createVerificationArtifact({ claimId: body.claimId, verifier: body.verifier as ArtifactVerifier, repositoryUrl: body.repositoryUrl, commitHash: body.commitHash, verifierVersion: body.verifierVersion || null }); return NextResponse.json({ data: row }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Artifact could not be created." }, { status: 400 }); }
  }
  if (kind === "dependency") {
    if (!body.sourceLimitId || !body.targetLimitId || !body.relation) return NextResponse.json({ error: "sourceLimitId, targetLimitId, and relation are required." }, { status: 400 });
    if (!DEPENDENCY_RELATIONS.includes(body.relation as DependencyRelation)) return NextResponse.json({ error: "Unsupported dependency relation." }, { status: 400 });
    try {
      const row = await createDependency({ sourceLimitId: body.sourceLimitId, targetLimitId: body.targetLimitId, relation: body.relation as DependencyRelation, evidenceClaimId: body.evidenceClaimId || null });
      return NextResponse.json({ data: row }, { status: 201 });
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Dependency could not be created." }, { status: 400 }); }
  }
  if (kind === "bounty") {
    if (!body.limitId || !body.title || !body.sponsor || !body.description || !body.sourceUrl) return NextResponse.json({ error: "limitId, title, sponsor, description, and sourceUrl are required." }, { status: 400 });
    try { const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null; const row = await createBounty({ limitId: body.limitId, title: body.title, sponsor: body.sponsor, description: body.description, sourceUrl: body.sourceUrl, amount: body.amount || null, currency: body.currency || null, expiresAt, submittedByUserId: session.user.id }); return NextResponse.json({ data: row }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Bounty could not be created." }, { status: 400 }); }
  }
  return NextResponse.json({ error: "kind must be artifact, dependency, or bounty." }, { status: 400 });
}
