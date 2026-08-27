import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { miplibRegistryNumber, parseMiplibSolutions, provenMiplibBenchmark } from "./miplib";
const solutions = readFileSync(new URL("../../data/miplib2017-v36.solu", import.meta.url), "utf8");
const benchmark = readFileSync(new URL("../../data/miplib-benchmark-v2.test", import.meta.url), "utf8");
describe("MIPLIB 2017 v36 catalog", () => {
  it("parses versioned solution statuses", () => { const rows = parseMiplibSolutions(solutions); expect(rows).toHaveLength(1065); expect(rows[0]).toEqual({ status: "opt", instance: "50v-10", objective: "3311.1799841" }); });
  it("selects only proven-optimal benchmark instances", () => { const rows = provenMiplibBenchmark(solutions, benchmark); expect(rows).toHaveLength(232); expect(rows.every((row) => row.objective.length > 0)).toBe(true); });
  it("assigns a non-overlapping stable registry range", () => { expect(miplibRegistryNumber(0)).toBe("LR-002000"); expect(miplibRegistryNumber(231)).toBe("LR-002231"); });
});
