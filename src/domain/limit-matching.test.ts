import { describe, expect, it } from "vitest";
import { matchLimitForPaper } from "./limit-matching";

const limits = [
  { id: "1", title: "Chromatic number of the plane (Hadwiger–Nelson problem)" },
  { id: "2", title: "Matrix multiplication exponent" },
];

describe("matchLimitForPaper", () => {
  it("matches on strong title keyword overlap", () => {
    const id = matchLimitForPaper({ title: "A new lower bound for the chromatic number of the plane", abstract: "We improve the Hadwiger-Nelson bound." }, limits);
    expect(id).toBe("1");
  });
  it("returns null when nothing overlaps enough", () => {
    const id = matchLimitForPaper({ title: "A survey of sorting networks", abstract: "We review known results." }, limits);
    expect(id).toBeNull();
  });
  it("returns null for empty limit list", () => {
    expect(matchLimitForPaper({ title: "Anything", abstract: null }, [])).toBeNull();
  });
});
