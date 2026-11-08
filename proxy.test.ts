import { describe, expect, it } from "vitest";
import { requiresSignIn } from "./proxy";

describe("requiresSignIn", () => {
  it.each(["/console", "/console/research", "/admin", "/account", "/account/apply", "/submit", "/bounties/propose", "/profile", "/reviewer-profile", "/watchlists", "/researchers/abc-123/claim"])("gates %s", (path) => {
    expect(requiresSignIn(path)).toBe(true);
  });

  it.each(["/", "/login", "/bounties", "/sponsor", "/watchlists/unsubscribe", "/researchers/abc-123", "/researchers", "/accounts", "/submitted", "/limits/LR-1"])("leaves %s public", (path) => {
    expect(requiresSignIn(path)).toBe(false);
  });
});
