import { asc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { claims, evidence, limits, specificationVersions } from "./schema";

export async function listPublishedLimits() { return db.select().from(limits).where(eq(limits.status, "OPEN")).orderBy(asc(limits.registryNumber)); }
export async function getPublishedLimit(registryNumber: string) { const rows = await db.select().from(limits).where(eq(limits.registryNumber, registryNumber)).limit(1); return rows[0] ?? null; }
export async function getLimitClaims(limitId: string) { const specs = await db.select({ id: specificationVersions.id }).from(specificationVersions).where(eq(specificationVersions.limitId, limitId)); if (specs.length === 0) return []; return db.select({ claim: claims, evidence: evidence }).from(claims).leftJoin(evidence, eq(evidence.id, claims.id)).where(eq(claims.specificationVersionId, specs[0].id)).orderBy(asc(claims.createdAt)); }
export async function getDatabaseHealth() { const result = await db.execute<{ ok: number }>(sql`select 1 as ok`); return result[0]?.ok === 1; }
