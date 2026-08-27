export type SearchMode = "exact" | "semantic";
export type SearchEntityType = "LIMIT" | "SPECIFICATION" | "CLAIM" | "PAPER";
export type SearchResult = { entityType: SearchEntityType; entityId: string; registryNumber: string | null; title: string; excerpt: string; url: string; score: number };
export function normalizeSearchQuery(value: string) { return value.trim().replace(/\s+/g, " ").slice(0, 500); }
export function exactRelevance(query: string, title: string, content: string) { const q = normalizeSearchQuery(query).toLowerCase(); if (!q) return 0; const t = title.toLowerCase(); const c = content.toLowerCase(); if (t === q) return 1; if (t.startsWith(q)) return 0.9; if (t.includes(q)) return 0.8; if (c.includes(q)) return 0.6; const terms = q.split(" "); const hits = terms.filter(term => t.includes(term) || c.includes(term)).length; return hits / terms.length * 0.5; }
export function searchResultUrl(entityType: SearchEntityType, entityId: string, registryNumber: string | null) { if (entityType === "PAPER") return `/papers/${entityId}`; return registryNumber ? `/limits/${registryNumber}` : "/browse"; }
export function embeddingNeedsRefresh(existingHash: string | null, status: string | null, nextHash: string) { return existingHash !== nextHash || status !== "READY"; }
