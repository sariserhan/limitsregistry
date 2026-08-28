import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, gt, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, breakthroughEvents, claims, dependencyRelations, limits, researchBounties, specificationVersions, verificationArtifacts, verifierExecutions, watchlistEvents } from "./schema";
import { createHash } from "node:crypto";
import { adaptVerifierExecution, type ArtifactVerifier } from "../verification/artifact-adapters";
import { validateBountyInput, isPublicBounty, type BountyStatus } from "../domain/bounties";
import { validateDependency, type DependencyRelation, type DependencyReviewStatus } from "../domain/dependencies";

export type DependencyRecord = Awaited<ReturnType<typeof listDependencies>>[number];

async function enrichDependencies(rows: (typeof dependencyRelations.$inferSelect)[]) {
  const ids = [...new Set(rows.flatMap((row) => [row.sourceLimitId, row.targetLimitId]))];
  if (!ids.length) return [];
  const records = await db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, status: limits.status }).from(limits).where(inArray(limits.id, ids));
  const byId = new Map(records.map((record) => [record.id, record]));
  return rows.flatMap((edge) => {
    const source = byId.get(edge.sourceLimitId);
    const target = byId.get(edge.targetLimitId);
    return source && target ? [{ ...edge, source, target }] : [];
  });
}

export async function listDependencies() {
  return enrichDependencies(await db.select().from(dependencyRelations).orderBy(desc(dependencyRelations.createdAt)));
}

export async function listAcceptedDependencies(limitId?: string) {
  const conditions = [eq(dependencyRelations.reviewStatus, "ACCEPTED")];
  if (limitId) conditions.push(or(eq(dependencyRelations.sourceLimitId, limitId), eq(dependencyRelations.targetLimitId, limitId))!);
  const enriched = await enrichDependencies(await db.select().from(dependencyRelations).where(and(...conditions)).orderBy(desc(dependencyRelations.createdAt)));
  return enriched.filter(({ source, target }) => ["OPEN", "PROVEN", "DISPUTED", "RETIRED"].includes(source.status) && ["OPEN", "PROVEN", "DISPUTED", "RETIRED"].includes(target.status));
}

export async function createDependency(input: { sourceLimitId: string; targetLimitId: string; relation: DependencyRelation; evidenceClaimId?: string | null }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7351771)`);
    const existing = await tx.select().from(dependencyRelations);
    const error = validateDependency({ ...input, reviewStatus: "DRAFT" }, existing);
    if (error) throw new Error(error);
    const knownLimits = await tx.select({ id: limits.id }).from(limits).where(inArray(limits.id, [input.sourceLimitId, input.targetLimitId]));
    if (knownLimits.length !== 2) throw new Error("Both source and target Limits must exist.");
    const [row] = await tx.insert(dependencyRelations).values({ ...input, evidenceClaimId: input.evidenceClaimId || null }).returning();
    return row;
  });
}

export async function decideDependency(input: { id: string; decision: Exclude<DependencyReviewStatus, "DRAFT">; actorUserId: string }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7351771)`);
    const [current] = await tx.select().from(dependencyRelations).where(eq(dependencyRelations.id, input.id));
    if (!current) throw new Error("Dependency not found.");
    if (input.decision === "ACCEPTED") {
      const existing = (await tx.select().from(dependencyRelations)).filter((edge) => edge.id !== current.id);
      const error = validateDependency({ ...current, reviewStatus: "ACCEPTED" }, existing);
      if (error) throw new Error(error);
    }
    const [updated] = await tx.update(dependencyRelations).set({ reviewStatus: input.decision, updatedAt: new Date() }).where(eq(dependencyRelations.id, input.id)).returning();
    await tx.insert(auditLogs).values({ actorUserId: input.actorUserId, action: `DEPENDENCY_${input.decision}`, entityType: "LIMIT_DEPENDENCY", entityId: input.id, before: current, after: updated });
    return updated;
  });
}

export async function listVerificationArtifacts(claimId?: string) {
  const artifacts = claimId ? await db.select().from(verificationArtifacts).where(eq(verificationArtifacts.claimId, claimId)).orderBy(desc(verificationArtifacts.createdAt)) : await db.select().from(verificationArtifacts).orderBy(desc(verificationArtifacts.createdAt));
  if (!artifacts.length) return [];
  const [executions, claimsData] = await Promise.all([
    db.select().from(verifierExecutions).where(inArray(verifierExecutions.artifactId, artifacts.map((artifact) => artifact.id))).orderBy(desc(verifierExecutions.createdAt)),
    db.select({ id: claims.id, claimNumber: claims.claimNumber }).from(claims).where(inArray(claims.id, [...new Set(artifacts.map((artifact) => artifact.claimId))])),
  ]);
  const claimById = new Map(claimsData.map((claim) => [claim.id, claim]));
  const executionsByArtifact = new Map<string, typeof executions>();
  for (const execution of executions) executionsByArtifact.set(execution.artifactId, [...(executionsByArtifact.get(execution.artifactId) ?? []), execution]);
  return artifacts.map((artifact) => ({ ...artifact, claim: claimById.get(artifact.claimId) ?? null, executions: executionsByArtifact.get(artifact.id) ?? [] }));
}

export async function createVerificationArtifact(input: { claimId: string; verifier: ArtifactVerifier; repositoryUrl: string; commitHash: string; verifierVersion?: string | null }) {
  if (!/^https:\/\//i.test(input.repositoryUrl)) throw new Error("Repository URL must use HTTPS.");
  if (!/^[0-9a-f]{40}$/i.test(input.commitHash)) throw new Error("Commit hash must be a full 40-character SHA.");
  const [claim] = await db.select({ id: claims.id }).from(claims).where(eq(claims.id, input.claimId));
  if (!claim) throw new Error("Claim not found.");
  const [artifact] = await db.insert(verificationArtifacts).values({ ...input, commitHash: input.commitHash.toLowerCase(), verifierVersion: input.verifierVersion || null }).returning();
  return artifact;
}

export async function decideVerificationArtifact(input: { id: string; decision: "ACCEPTED" | "REJECTED"; rationale: string; actorUserId: string }) {
  if (!input.rationale.trim()) throw new Error("A review rationale is required.");
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(verificationArtifacts).where(eq(verificationArtifacts.id, input.id));
    if (!current) throw new Error("Artifact not found.");
    const [updated] = await tx.update(verificationArtifacts).set({ reviewStatus: input.decision, reviewedByUserId: input.actorUserId, reviewRationale: input.rationale.trim(), updatedAt: new Date() }).where(eq(verificationArtifacts.id, input.id)).returning();
    await tx.insert(auditLogs).values({ actorUserId: input.actorUserId, action: `VERIFICATION_ARTIFACT_${input.decision}`, entityType: "VERIFICATION_ARTIFACT", entityId: input.id, before: current, after: updated, reason: input.rationale.trim() });
    return updated;
  });
}

export async function recordVerifierExecution(input: { artifactId: string; command: string; toolVersion: string; exitCode: number; stdout: string; stderr?: string; actorUserId: string }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7351772)`);
    const [artifact] = await tx.select().from(verificationArtifacts).where(eq(verificationArtifacts.id, input.artifactId));
    if (!artifact) throw new Error("Artifact not found.");
    if (artifact.reviewStatus !== "ACCEPTED") throw new Error("Only accepted artifacts can record verifier executions.");
    const adapted = adaptVerifierExecution({ verifier: artifact.verifier as ArtifactVerifier, command: input.command, toolVersion: input.toolVersion, exitCode: input.exitCode, stdout: input.stdout, stderr: input.stderr });
    const now = new Date();
    const outputDigest = createHash("sha256").update(`${input.stdout}\n${input.stderr ?? ""}`).digest("hex");
    const [execution] = await tx.insert(verifierExecutions).values({ artifactId: artifact.id, verifier: artifact.verifier, command: input.command.trim(), toolVersion: input.toolVersion.trim(), exitCode: input.exitCode, status: adapted.status, reproducible: adapted.reproducible, outputSummary: adapted.summary, outputDigest, executedByUserId: input.actorUserId, startedAt: now, completedAt: now }).returning();
    const machineChecked = adapted.status === "PASSED" && adapted.reproducible;
    const [updatedArtifact] = await tx.update(verificationArtifacts).set({ buildResult: adapted.status === "PASSED" ? "PASSED" : "FAILED", verificationLevel: machineChecked ? "MACHINE_CHECKED" : "ARTIFACT_LINKED", verifierVersion: input.toolVersion.trim(), updatedAt: now }).where(eq(verificationArtifacts.id, artifact.id)).returning();
    await tx.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "VERIFIER_EXECUTION_RECORDED", entityType: "VERIFICATION_ARTIFACT", entityId: artifact.id, before: artifact, after: { artifact: updatedArtifact, execution }, reason: adapted.summary });
    return { execution, artifact: updatedArtifact };
  });
}

export async function listPublishedVerificationHistory(limitId: string) {
  return db.select({ artifact: verificationArtifacts, execution: verifierExecutions, claimNumber: claims.claimNumber }).from(verificationArtifacts).innerJoin(claims, eq(claims.id, verificationArtifacts.claimId)).innerJoin(specificationVersions, eq(specificationVersions.id, claims.specificationVersionId)).innerJoin(verifierExecutions, eq(verifierExecutions.artifactId, verificationArtifacts.id)).where(and(eq(specificationVersions.limitId, limitId), eq(claims.status, "ACCEPTED"), eq(verificationArtifacts.reviewStatus, "ACCEPTED"), eq(verificationArtifacts.verificationLevel, "MACHINE_CHECKED"), eq(verifierExecutions.status, "PASSED"), eq(verifierExecutions.reproducible, true))).orderBy(desc(verifierExecutions.completedAt));
}
export async function listBounties() { const rows = await db.select().from(researchBounties).orderBy(desc(researchBounties.createdAt)); const ids = [...new Set(rows.flatMap((row) => row.limitId ? [row.limitId] : []))]; const limitRows = ids.length ? await db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, status: limits.status }).from(limits).where(inArray(limits.id, ids)) : []; const byId = new Map(limitRows.map((limit) => [limit.id, limit])); return rows.map((row) => ({ ...row, limit: row.limitId ? byId.get(row.limitId) ?? null : null })); }
export async function createBounty(input: { limitId: string; title: string; sponsor: string; description: string; sourceUrl: string; amount?: string | null; currency?: string | null; expiresAt?: Date | null; submittedByUserId: string }) { const error = validateBountyInput(input); if (error) throw new Error(error); const [limit] = await db.select({ id: limits.id }).from(limits).where(eq(limits.id, input.limitId)); if (!limit) throw new Error("Linked Limit not found."); const [row] = await db.insert(researchBounties).values({ ...input, title: input.title.trim(), sponsor: input.sponsor.trim(), description: input.description.trim(), sourceUrl: input.sourceUrl.trim(), amount: input.amount?.trim() || null, currency: input.currency?.trim().toUpperCase() || null, expiresAt: input.expiresAt ?? null }).returning(); return row; }
export async function moderateBounty(input: { id: string; decision: Exclude<BountyStatus, "UNVERIFIED">; note: string; actorUserId: string }) { if (input.note.trim().length < 10) throw new Error("A moderation note of at least 10 characters is required."); return db.transaction(async (tx) => { const [current] = await tx.select().from(researchBounties).where(eq(researchBounties.id, input.id)); if (!current) throw new Error("Bounty not found."); if (input.decision === "VERIFIED") { if (!current.limitId) throw new Error("A verified bounty must link to a Limit."); const [limit] = await tx.select({ status: limits.status }).from(limits).where(eq(limits.id, current.limitId)); if (!limit || !["OPEN", "PROVEN", "DISPUTED", "RETIRED"].includes(limit.status)) throw new Error("A verified bounty must link to a published Limit."); if (current.expiresAt && current.expiresAt <= new Date()) throw new Error("An expired bounty cannot be verified."); } const now = new Date(); const [updated] = await tx.update(researchBounties).set({ status: input.decision, moderationNote: input.note.trim(), verifiedByUserId: input.actorUserId, verifiedAt: input.decision === "VERIFIED" ? now : null, updatedAt: now }).where(eq(researchBounties.id, input.id)).returning(); await tx.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "BOUNTY_" + input.decision, entityType: "RESEARCH_BOUNTY", entityId: input.id, before: current, after: updated, reason: input.note.trim() }); return updated; }); }
export async function listPublicBounties(limitId?: string) {
  const read = unstable_cache(async () => {
    const conditions = [eq(researchBounties.status, "VERIFIED"), or(isNull(researchBounties.expiresAt), gt(researchBounties.expiresAt, new Date()))!];
    if (limitId) conditions.push(eq(researchBounties.limitId, limitId));
    const rows = await db.select({ bounty: researchBounties, limit: { id: limits.id, registryNumber: limits.registryNumber, title: limits.title } }).from(researchBounties).innerJoin(limits, eq(limits.id, researchBounties.limitId)).where(and(...conditions, inArray(limits.status, ["OPEN", "PROVEN", "DISPUTED", "RETIRED"]))).orderBy(desc(researchBounties.verifiedAt));
    return rows.filter(({ bounty }) => isPublicBounty(bounty.status, bounty.expiresAt));
  }, ["public-bounties", limitId ?? "all"], { revalidate: 60, tags: ["public-bounties"] });
  const rows = await read();
  // expiresAt/verifiedAt round-trip through unstable_cache's JSON cache as strings despite their Date type.
  return rows.map((row) => ({ ...row, bounty: { ...row.bounty, expiresAt: row.bounty.expiresAt ? new Date(row.bounty.expiresAt) : null, verifiedAt: row.bounty.verifiedAt ? new Date(row.bounty.verifiedAt) : null } }));
}
export const listBreakthroughEvents = (limitId: string) => db.select().from(breakthroughEvents).where(eq(breakthroughEvents.limitId, limitId)).orderBy(desc(breakthroughEvents.occurredAt));
export const listWatchlistEvents = (limitId: string) => db.select().from(watchlistEvents).where(and(eq(watchlistEvents.limitId, limitId), isNotNull(watchlistEvents.publishedAt))).orderBy(desc(watchlistEvents.createdAt));
