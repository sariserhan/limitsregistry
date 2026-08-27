import { describe, expect, it } from "vitest";
import { hasRole, ROLES } from "./permissions";

describe("hasRole", () => {
  it("allows a role to satisfy its own minimum and every lower minimum", () => {
    for (let i = 0; i < ROLES.length; i++) {
      for (let j = 0; j <= i; j++) expect(hasRole(ROLES[i], ROLES[j])).toBe(true);
    }
  });

  it("rejects a role below the required minimum", () => {
    for (let i = 0; i < ROLES.length; i++) {
      for (let j = i + 1; j < ROLES.length; j++) expect(hasRole(ROLES[i], ROLES[j])).toBe(false);
    }
  });

  it("rejects a missing session (null/undefined role)", () => {
    expect(hasRole(null, "USER")).toBe(false);
    expect(hasRole(undefined, "USER")).toBe(false);
  });
});
