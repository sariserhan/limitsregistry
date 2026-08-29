import { describe, expect, it } from "vitest";
import { chemistryRecords } from "./chemistry";

describe("chemistry catalog", () => {
  it("contains ten unique, source-backed records", () => {
    expect(chemistryRecords).toHaveLength(10);
    expect(new Set(chemistryRecords.map((record) => record.registryNumber)).size).toBe(10);
    expect(new Set(chemistryRecords.map((record) => record.slug)).size).toBe(10);
    expect(chemistryRecords.every((record) => record.source.url.startsWith("https://"))).toBe(true);
  });
  it("covers varied chemistry fields and epistemic statuses", () => {
    expect(new Set(chemistryRecords.map((record) => record.subcategory)).size).toBe(8);
    expect(chemistryRecords.some((record) => record.status === "OPEN")).toBe(true);
    expect(chemistryRecords.some((record) => record.claimType === "EXACT_VALUE")).toBe(true);
    expect(chemistryRecords.some((record) => Object.keys(record.constraints).length >= 5)).toBe(true);
  });
});
