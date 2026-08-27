import { NextResponse } from "next/server";
import { requireRole } from "../../../../src/auth/session";
import { db } from "../../../../src/db/client";
import { researchBounties, verificationArtifacts } from "../../../../src/db/schema";
import { createDependency } from "../../../../src/db/repository.research";
import { DEPENDENCY_RELATIONS, type DependencyRelation } from "../../../../src/domain/dependencies";
export const runtime = "nodejs";
export async function POST(request: Request) {
  await requireRole("RESEARCHER");
  const body = await request.json() as Record<string, string>;
  const kind = body.kind;
  if (kind === "artifact") {
    if (!body.claimId || !body.verifier || !body.repositoryUrl || !body.commitHash) return NextResponse.json({ error: "claimId, verifier, repositoryUrl, and commitHash are required." }, { status: 400 });
    const [row] = await db.insert(verificationArtifacts).values({ claimId: body.claimId, verifier: body.verifier, repositoryUrl: body.repositoryUrl, commitHash: body.commitHash, verifierVersion: body.verifierVersion || null }).returning();
    return NextResponse.json({ data: row }, { status: 201 });
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
    if (!body.title || !body.sponsor || !body.description || !body.sourceUrl || !/^https:\/\//i.test(body.sourceUrl)) return NextResponse.json({ error: "title, sponsor, description, and HTTPS sourceUrl are required." }, { status: 400 });
    const [row] = await db.insert(researchBounties).values({ limitId: body.limitId || null, title: body.title, sponsor: body.sponsor, description: body.description, sourceUrl: body.sourceUrl, amount: body.amount || null, currency: body.currency || null }).returning();
    return NextResponse.json({ data: row }, { status: 201 });
  }
  return NextResponse.json({ error: "kind must be artifact, dependency, or bounty." }, { status: 400 });
}
