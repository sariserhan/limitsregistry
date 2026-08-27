import { describe, expect, it } from "vitest";
import { detectContradiction } from "./contradiction";

describe("detectContradiction", () => {
  it("flags a lower bound that exceeds an accepted upper bound", () => {
    const result = detectContradiction([{ relation: "<=", valueNumeric: 5 }], { relation: ">=", valueNumeric: 7 });
    expect(result).toMatch(/exceeds/i);
  });
  it("flags an upper bound that falls below an accepted lower bound", () => {
    const result = detectContradiction([{ relation: ">=", valueNumeric: 7 }], { relation: "<=", valueNumeric: 5 });
    expect(result).toMatch(/below/i);
  });
  it("flags a differing exact value", () => {
    const result = detectContradiction([{ relation: "=", valueNumeric: 5 }], { relation: "=", valueNumeric: 6 });
    expect(result).toMatch(/conflicts/i);
  });
  it("allows a compatible bound", () => {
    expect(detectContradiction([{ relation: "<=", valueNumeric: 7 }], { relation: ">=", valueNumeric: 5 })).toBeNull();
  });
});
