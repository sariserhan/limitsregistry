import "server-only";
import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { limits } from "./schema";

export const PUBLIC_LIMIT_STATUSES = ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const;
export type PublicLimitStatus = (typeof PUBLIC_LIMIT_STATUSES)[number];
export type PublicLimitSort = "newest" | "oldest" | "alphabetical" | "alphabetical-desc" | "status";

export type PublicLimitPageOptions = {
  page?: number;
  pageSize?: number;
  query?: string;
  category?: string;
  status?: PublicLimitStatus;
  sort?: PublicLimitSort;
};

function orderBy(sort: PublicLimitSort) {
  if (sort === "oldest") return [asc(limits.publishedAt), asc(limits.registryNumber)] as const;
  if (sort === "alphabetical") return [asc(limits.title), asc(limits.registryNumber)] as const;
  if (sort === "alphabetical-desc") return [desc(limits.title), desc(limits.registryNumber)] as const;
  if (sort === "status") return [asc(limits.status), asc(limits.title), asc(limits.registryNumber)] as const;
  return [desc(limits.publishedAt), asc(limits.registryNumber)] as const;
}

export async function listPublicLimitPage(options: PublicLimitPageOptions = {}) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 50, 1), 100);
  const requestedPage = Math.max(options.page ?? 1, 1);
  const query = options.query?.trim() ?? "";
  const category = options.category?.trim() ?? "";
  const status = options.status;
  const sort = options.sort ?? "newest";
  const conditions = [inArray(limits.status, PUBLIC_LIMIT_STATUSES)];
  if (query) {
    const pattern = `%${query}%`;
    conditions.push(sql`(${ilike(limits.title, pattern)} or ${ilike(limits.summary, pattern)} or ${ilike(limits.registryNumber, pattern)} or ${ilike(limits.category, pattern)})`);
  }
  if (category) conditions.push(eq(limits.category, category));
  if (status) conditions.push(eq(limits.status, status));
  const where = and(...conditions);
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(limits).where(where),
    db.select().from(limits).where(where).orderBy(...orderBy(sort)).limit(pageSize).offset((requestedPage - 1) * pageSize),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { rows, total, page: Math.min(requestedPage, pageCount), pageSize, pageCount };
}

export async function listPublicLimitOptions(query = "", resultLimit = 50) {
  const normalizedQuery = query.trim();
  const conditions = [inArray(limits.status, PUBLIC_LIMIT_STATUSES)];
  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    conditions.push(sql`(${ilike(limits.title, pattern)} or ${ilike(limits.registryNumber, pattern)} or ${ilike(limits.category, pattern)})`);
  }
  return db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, summary: limits.summary, category: limits.category, direction: limits.direction, status: limits.status })
    .from(limits).where(and(...conditions)).orderBy(asc(limits.registryNumber)).limit(Math.min(Math.max(resultLimit, 1), 100));
  }
export async function listPublicLimitStatusCounts(category?: string) {
  const conditions = [inArray(limits.status, PUBLIC_LIMIT_STATUSES)];
  if (category) conditions.push(eq(limits.category, category));
  const rows = await db.select({ status: limits.status, count: sql<number>`count(*)::int` }).from(limits).where(and(...conditions)).groupBy(limits.status).orderBy(asc(limits.status));
  return rows.map((row) => [row.status, row.count] as [PublicLimitStatus, number]);
}
export async function getPublicLimitOptionById(id: string) {
  const [row] = await db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, summary: limits.summary, category: limits.category, direction: limits.direction, status: limits.status }).from(limits).where(and(eq(limits.id, id), inArray(limits.status, PUBLIC_LIMIT_STATUSES))).limit(1);
  return row ?? null;
}

export async function getPublicLimitOptionByRegistryNumber(registryNumber: string) {
  const [row] = await db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, summary: limits.summary, category: limits.category, direction: limits.direction, status: limits.status }).from(limits).where(and(eq(limits.registryNumber, registryNumber), inArray(limits.status, PUBLIC_LIMIT_STATUSES))).limit(1);
  return row ?? null;
}


