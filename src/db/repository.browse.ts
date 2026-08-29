import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { claims, limits, specificationVersions, timelineEvents } from "./schema";
import { serializeClaim, serializeSpecification } from "./serializers";
import { deriveFrontier } from "../domain/frontier";

export const PUBLIC_LIMIT_STATUSES = ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const;
export type BrowseStatus = "ALL" | (typeof PUBLIC_LIMIT_STATUSES)[number];
export type BrowsePageOptions = { page?: number; pageSize?: number; query?: string; category?: string; status?: BrowseStatus };

export async function listPublishedBrowsePage(options: BrowsePageOptions = {}) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 4, 1), 50);
  const page = Math.max(options.page ?? 1, 1);
  const query = (options.query ?? "").trim();
  const category = (options.category ?? "").trim();
  const status: BrowseStatus = options.status && options.status !== "ALL" && PUBLIC_LIMIT_STATUSES.includes(options.status) ? options.status : "ALL";
  const read = unstable_cache(async () => {
    const conditions = [inArray(limits.status, PUBLIC_LIMIT_STATUSES)];
    if (query) { const pattern = `%${query}%`; conditions.push(sql`(${limits.title} ilike ${pattern} or ${limits.category} ilike ${pattern} or ${limits.registryNumber} ilike ${pattern})`); }
    if (category) conditions.push(eq(limits.category, category));
    if (status !== "ALL") conditions.push(eq(limits.status, status));
    const where = and(...conditions);
    const [[{ total }], rows] = await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(limits).where(where),
      db.select().from(limits).where(where).orderBy(desc(limits.publishedAt), asc(limits.registryNumber)).limit(pageSize).offset((page - 1) * pageSize),
    ]);
    const limitIds = rows.map((row) => row.id);
    if (!limitIds.length) return { total, rows: [] as Array<{ limit: typeof limits.$inferSelect; specification: ReturnType<typeof serializeSpecification>; claims: ReturnType<typeof serializeClaim>[]; timeline: Array<{ id: string; title: string; description: string | null; occurredAt: Date }>; frontier: ReturnType<typeof deriveFrontier> }> };
    const specs = await db.select().from(specificationVersions).where(inArray(specificationVersions.limitId, limitIds)).orderBy(desc(specificationVersions.versionNumber));
    const currentSpecs = new Map<string, typeof specs[number]>();
    for (const spec of specs) if (!currentSpecs.has(spec.limitId)) currentSpecs.set(spec.limitId, spec);
    const specIds = [...currentSpecs.values()].map((spec) => spec.id);
    const [claimRows, eventRows] = await Promise.all([
      specIds.length ? db.select().from(claims).where(and(inArray(claims.specificationVersionId, specIds), eq(claims.status, "ACCEPTED"))).orderBy(asc(claims.createdAt)) : Promise.resolve([]),
      db.select({ limitId: timelineEvents.limitId, id: timelineEvents.id, title: timelineEvents.title, description: timelineEvents.description, occurredAt: timelineEvents.occurredAt }).from(timelineEvents).where(inArray(timelineEvents.limitId, limitIds)).orderBy(desc(timelineEvents.occurredAt)),
    ]);
    const claimsBySpec = new Map<string, typeof claimRows>();
    for (const claim of claimRows) claimsBySpec.set(claim.specificationVersionId, [...(claimsBySpec.get(claim.specificationVersionId) ?? []), claim]);
    const eventsByLimit = new Map<string, typeof eventRows>();
    for (const event of eventRows) eventsByLimit.set(event.limitId, [...(eventsByLimit.get(event.limitId) ?? []), event]);
    return { total, rows: rows.flatMap((limit) => { const spec = currentSpecs.get(limit.id); if (!spec) return []; const specification = serializeSpecification(spec); const acceptedClaims = (claimsBySpec.get(spec.id) ?? []).map((claim) => serializeClaim({ ...claim, createdAt: new Date(claim.createdAt) })); return [{ limit, specification, claims: acceptedClaims, timeline: eventsByLimit.get(limit.id) ?? [], frontier: deriveFrontier(limit.direction, specification, acceptedClaims) }]; }) };
  }, ["published-browse-page", String(page), String(pageSize), query, category, status], { revalidate: 60, tags: ["published-limits"] });
  const result = await read();
  return { ...result, page, pageSize, pageCount: Math.max(1, Math.ceil(result.total / pageSize)) };
}

export async function listPublishedBrowseFacets() {
  const read = unstable_cache(async () => {
    const [categoryRows, statusRows] = await Promise.all([
      db.select({ category: limits.category, count: sql<number>`count(*)::int` }).from(limits).where(inArray(limits.status, PUBLIC_LIMIT_STATUSES)).groupBy(limits.category).orderBy(asc(limits.category)),
      db.select({ status: limits.status, count: sql<number>`count(*)::int` }).from(limits).where(inArray(limits.status, PUBLIC_LIMIT_STATUSES)).groupBy(limits.status).orderBy(asc(limits.status)),
    ]);
    return { categories: categoryRows.map((row) => [row.category, row.count] as [string, number]), statuses: statusRows.map((row) => [row.status, row.count] as [Exclude<BrowseStatus, "ALL">, number]) };
  }, ["published-browse-facets"], { revalidate: 300, tags: ["published-limits"] });
  return read();
}
