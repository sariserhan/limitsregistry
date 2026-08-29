import "server-only";
import { and, asc, eq, inArray, ne, or } from "drizzle-orm";
import { db } from "./client";
import { limits } from "./schema";

const PUBLIC_STATUSES = ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const;

export async function listRelatedPublicLimits(input: { id: string; category: string; subcategory?: string | null; resultLimit?: number }) {
  return db.select({ id: limits.id, registryNumber: limits.registryNumber, title: limits.title, summary: limits.summary, category: limits.category, status: limits.status })
    .from(limits)
    .where(and(inArray(limits.status, PUBLIC_STATUSES), ne(limits.id, input.id), input.subcategory ? or(eq(limits.category, input.category), eq(limits.subcategory, input.subcategory)) : eq(limits.category, input.category)))
    .orderBy(asc(limits.title), asc(limits.registryNumber))
    .limit(Math.min(Math.max(input.resultLimit ?? 6, 1), 12));
}
