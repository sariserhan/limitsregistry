import { describe, expect, it } from "vitest";
import { canRefreshSearchIndex } from "./access";
import { embeddingNeedsRefresh, exactRelevance, normalizeSearchQuery, searchResultUrl } from "./search";
describe("semantic search contracts", () => {
  it("normalizes and bounds user queries", () => { expect(normalizeSearchQuery("  planar   shortest path ")).toBe("planar shortest path"); expect(normalizeSearchQuery("x".repeat(800))).toHaveLength(500); });
  it("ranks exact titles above partial content matches", () => { expect(exactRelevance("Landauer limit", "Landauer limit", "thermodynamic erasure")).toBe(1); expect(exactRelevance("erasure", "Landauer limit", "thermodynamic erasure")).toBeLessThan(1); expect(exactRelevance("", "Anything", "Anything")).toBe(0); });
  it("retries failed embeddings and skips unchanged ready documents", () => { expect(embeddingNeedsRefresh("same", "FAILED", "same")).toBe(true); expect(embeddingNeedsRefresh("same", "READY", "same")).toBe(false); expect(embeddingNeedsRefresh("old", "READY", "new")).toBe(true); });
  it("maps public entities to canonical destinations", () => { expect(searchResultUrl("PAPER", "paper-1", null)).toBe("/papers/paper-1"); expect(searchResultUrl("CLAIM", "claim-1", "LR-000072")).toBe("/limits/LR-000072"); });
  it("restricts reindexing to editors and above", () => { expect(canRefreshSearchIndex("RESEARCHER")).toBe(false); expect(canRefreshSearchIndex("EDITOR")).toBe(true); expect(canRefreshSearchIndex("ADMIN")).toBe(true); });
});
