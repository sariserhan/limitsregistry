import { describe, expect, it } from "vitest";
import { periodicElementRecords } from "./periodic-elements";

describe("periodic element catalog", () => {
  it("contains 75 source-backed exact element identities", () => {
    expect(periodicElementRecords).toHaveLength(75);
    expect(periodicElementRecords.map((record) => record.atomicNumber)).toEqual(Array.from({ length: 75 }, (_, index) => index + 1));
    expect(new Set(periodicElementRecords.map((record) => record.symbol)).size).toBe(75);
    expect(periodicElementRecords.every((record) => record.abstract.length > 80 && record.sourceUrl.startsWith("https://"))).toBe(true);
  });
});
