import { describe, expect, it } from "vitest";
import { hasActiveSponsorship, sponsorshipRequestSchema, invoiceSchema, validateWindow } from "./bounty-sponsorship";
const now = new Date("2026-09-20T12:00:00Z");
const term = { status: "PAID", startsAt: new Date("2026-09-20T12:00:00Z"), endsAt: new Date("2026-12-19T12:00:00Z") };
describe("sponsor placement", () => {
  it("includes the start and excludes the end without relying on cron", () => {
    expect(hasActiveSponsorship(term, "VERIFIED", null, "OPEN", now)).toBe(true);
    expect(hasActiveSponsorship(term, "VERIFIED", null, "OPEN", term.endsAt)).toBe(false);
    expect(hasActiveSponsorship(term, "VERIFIED", null, "OPEN", new Date(now.getTime()-1))).toBe(false);
  });
  it("requires independent approval, a published limit and an active bounty", () => {
    for (const status of ["UNVERIFIED", "REJECTED", "WITHDRAWN"]) expect(hasActiveSponsorship(term, status, null, "OPEN", now)).toBe(false);
    expect(hasActiveSponsorship(term, "VERIFIED", null, "DRAFT", now)).toBe(false);
    expect(hasActiveSponsorship(term, "VERIFIED", now, "OPEN", now)).toBe(false);
    for (const status of ["REQUESTED", "INVOICED", "LAPSED", "CANCELLED", "REFUNDED"]) expect(hasActiveSponsorship({...term, status}, "VERIFIED", null, "OPEN", now)).toBe(false);
    expect(hasActiveSponsorship({...term, startsAt:null}, "VERIFIED", null, "OPEN", now)).toBe(false);
  });
  it("rejects inverted windows and a term extending past the award expiry", () => {
    expect(validateWindow(term.endsAt, term.startsAt, null)).toBeTruthy();
    expect(validateWindow(term.startsAt, term.endsAt, now)).toBeTruthy();
    expect(validateWindow(term.startsAt, term.endsAt, term.endsAt)).toBeNull();
  });
  it("bounds fees and requires an invoice", () => {
    for (const amount of ["0", "-1", "Infinity", "1000000000", "1.001"]) expect(invoiceSchema.safeParse({ feeAmount:amount,feeCurrency:"USD",invoiceReference:"INV-1" }).success).toBe(false);
    expect(invoiceSchema.safeParse({ feeAmount:"100.00",feeCurrency:"USD",invoiceReference:"INV-1" }).success).toBe(true);
  });
  it("rejects credential-bearing sponsor URLs and invalid contacts", () => {
    const input = { limitId:"55555555-5555-4555-8555-555555555555",title:"Research prize",sponsor:"Institute",description:"A complete description of the research award.",sourceUrl:"https://example.org/terms",amount:"1000",currency:"USD",sponsorUrl:"https://example.org",contactEmail:"hello@example.org",expiresAt:"",acknowledgement:"on" };
    expect(sponsorshipRequestSchema.safeParse(input).success).toBe(true);
    expect(sponsorshipRequestSchema.safeParse({...input,sponsorUrl:"https://user:pass@example.org"}).success).toBe(false);
    expect(sponsorshipRequestSchema.safeParse({...input,contactEmail:"bad"}).success).toBe(false);
  });
});
