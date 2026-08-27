import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { claimEvidence, claims, evidence, limits, specificationVersions } from "./schema";

export async function listPublishedLimits() { return db.select().from(limits).where(inArray(limits.status, ["OPEN", "PROVEN"])).orderBy(asc(limits.registryNumber)); }
export async function getPublishedLimit(registryNumber: string) { const rows = await db.select().from(limits).where(and(inArray(limits.status, ["OPEN", "PROVEN"]), eq(limits.registryNumber, registryNumber))).limit(1); return rows[0] ?? null; }
export async function getLimitClaims(limitId: string) { const specs = await db.select({ id: specificationVersions.id }).from(specificationVersions).where(eq(specificationVersions.limitId, limitId)); if (specs.length === 0) return []; return db.select({ claim: claims, evidence: evidence }).from(claims).innerJoin(claimEvidence, eq(claimEvidence.claimId, claims.id)).innerJoin(evidence, eq(evidence.id, claimEvidence.evidenceId)).where(eq(claims.specificationVersionId, specs[0].id)).orderBy(asc(claims.createdAt)); }
export async function getDatabaseHealth() { const result = await db.execute<{ ok: number }>(sql`select 1 as ok`); return result[0]?.ok === 1; }
