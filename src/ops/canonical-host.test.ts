import { describe, expect, it } from "vitest";
import { canonicalRedirect } from "./canonical-host";

const at = (url: string) => ({ nextUrl: new URL(url) }) as Parameters<typeof canonicalRedirect>[0];
const production = { VERCEL_ENV: "production" };

describe("canonicalRedirect", () => {
  it("sends the .vercel.app copy of a page to the real domain, permanently", () => {
    const response = canonicalRedirect(at("https://limitsregistry.vercel.app/limits/LR-001237?ref=x"), production);
    expect(response?.status).toBe(308);
    expect(response?.headers.get("location")).toBe("https://www.limitsregistry.com/limits/LR-001237?ref=x");
  });

  it("leaves the real domain alone", () => {
    expect(canonicalRedirect(at("https://www.limitsregistry.com/limits/LR-1"), production)).toBeNull();
  });

  it("leaves preview deployments on their own URL", () => {
    expect(canonicalRedirect(at("https://limitsregistry-git-feature-team.vercel.app/"), { VERCEL_ENV: "preview" })).toBeNull();
  });

  it("does not redirect API paths, which crons and webhooks may call on the deployment URL", () => {
    expect(canonicalRedirect(at("https://limitsregistry.vercel.app/api/cron/source-ingestion"), production)).toBeNull();
    expect(canonicalRedirect(at("https://limitsregistry.vercel.app/.well-known/vercel/x"), production)).toBeNull();
  });
});
