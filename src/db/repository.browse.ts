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
    if (!limitIds.length) return { total, rows: [] as Array<{ limit: typeof limits.$inferSelect; specRow: typeof specificationVersions.$inferSelect; claimRows: (typeof claims.$inferSelect)[]; timeline: Array<{ id: string; title: string; description: string | null; occurredAt: Date }> }> };
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
    // Claim rows are kept raw here (not run through serializeClaim) and specification versions
    // stay raw too — parseExact() can produce a BigInt for integer-valued claims (genome sizes,
    // Ramsey numbers, MIPLIB objectives...), and unstable_cache JSON-serializes its return value
    // to store it; BigInt isn't JSON-serializable and throws before the cache write even
    // completes. All serialization (and the Date fields that round-trip as strings) happens after
    // the cache boundary instead, below — same pattern as getLimitResearchData.
    return { total, rows: rows.flatMap((limit) => { const spec = currentSpecs.get(limit.id); if (!spec) return []; return [{ limit, specRow: spec, claimRows: claimsBySpec.get(spec.id) ?? [], timeline: eventsByLimit.get(limit.id) ?? [] }]; }) };
  }, ["published-browse-page", String(page), String(pageSize), query, category, status], { revalidate: 60, tags: ["published-limits"] });
  const result = await read();
  const hydratedRows = result.rows.map(({ limit, specRow, claimRows, timeline }) => {
    const hydratedLimit = { ...limit, publishedAt: limit.publishedAt ? new Date(limit.publishedAt) : null, createdAt: new Date(limit.createdAt), updatedAt: new Date(limit.updatedAt) };
    const specification = serializeSpecification({ ...specRow, createdAt: new Date(specRow.createdAt), updatedAt: new Date(specRow.updatedAt) });
    const acceptedClaims = claimRows.map((claim) => serializeClaim({ ...claim, createdAt: new Date(claim.createdAt) }));
    const hydratedTimeline = timeline.map((event) => ({ ...event, occurredAt: new Date(event.occurredAt) }));
    return { limit: hydratedLimit, specification, claims: acceptedClaims, timeline: hydratedTimeline, frontier: deriveFrontier(limit.direction, specification, acceptedClaims) };
  });
  return { total: result.total, rows: hydratedRows, page, pageSize, pageCount: Math.max(1, Math.ceil(result.total / pageSize)) };
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
