import { describe, expect, it } from "vitest";
import { scienceFrontierRecords } from "./science-frontiers";

describe("science frontier catalog", () => {
  it("contains five sourced records in each requested category", () => {
    expect(scienceFrontierRecords).toHaveLength(20);
    expect(new Set(scienceFrontierRecords.map((record) => record.registryNumber)).size).toBe(20);
    for (const category of ["Materials Science", "Biology", "Earth & Climate", "Medicine & Physiology"]) expect(scienceFrontierRecords.filter((record) => record.category === category)).toHaveLength(5);
    expect(scienceFrontierRecords.every((record) => record.summary.length > 40 && record.abstract.length > 80 && record.source.url.startsWith("https://"))).toBe(true);
  });
  it("contains both empirical and proven records", () => {
    expect(scienceFrontierRecords.some((record) => record.status === "PROVEN")).toBe(true);
    expect(scienceFrontierRecords.some((record) => record.status === "OPEN")).toBe(true);
  });
});
