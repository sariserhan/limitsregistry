import { describe, expect, it } from "vitest";
import { findDuplicatePaper } from "./duplicate-detection";

const existing = [
  { id: "1", doi: "10.1/abc", arxivId: null, title: "Cap sets in the ternary grid" },
  { id: "2", doi: null, arxivId: "2101.00001", title: "Synchronizing words" },
];

describe("findDuplicatePaper", () => {
  it("matches by DOI first", () => {
    expect(findDuplicatePaper(existing, { doi: "10.1/ABC", title: "different title" })?.id).toBe("1");
  });
  it("matches by arXiv id", () => {
    expect(findDuplicatePaper(existing, { arxivId: "2101.00001", title: "different title" })?.id).toBe("2");
  });
  it("falls back to normalized title", () => {
    expect(findDuplicatePaper(existing, { title: "Cap Sets In The Ternary Grid!" })?.id).toBe("1");
  });
  it("returns null when nothing matches", () => {
    expect(findDuplicatePaper(existing, { title: "A wholly new paper" })).toBeNull();
  });
});
