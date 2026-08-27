import { describe, expect, it } from "vitest";
import { deriveFrontier } from "./frontier";
import { fixtures } from "./fixtures";

describe("deriveFrontier", () => {
  for (const fixture of fixtures) {
    it(`handles ${fixture.name}`, () => {
      const result = deriveFrontier(fixture.limit.direction, fixture.specification, fixture.claims);
      expect(result.status).toBe(fixture.expected.status);
      expect(result.gap).toBe(fixture.expected.gap);
    });
  }
});
