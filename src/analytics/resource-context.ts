import { AsyncLocalStorage } from "node:async_hooks";

export type ResourceCounters = { reads: number; writes: number; unknown: boolean };
export const resourceContext = new AsyncLocalStorage<ResourceCounters>();

/** Counts attempted SQL statements, never query text/parameters, rows, or billed CU-hours. */
export function countResourceQuery(query: string) {
  const counters = resourceContext.getStore();
  if (!counters) return;
  if (/^\s*select\b/i.test(query)) counters.reads++;
  else if (/^\s*(insert|update|delete)\b/i.test(query)) counters.writes++;
  else if (!/^\s*(begin|commit|rollback|savepoint|release)\b/i.test(query)) counters.unknown = true;
}
