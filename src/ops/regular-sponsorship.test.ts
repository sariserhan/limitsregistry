import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn(), limit: vi.fn(), record: vi.fn(), categories: vi.fn() }));
vi.mock("../db/repository.inbox", () => ({ createInboxMessage: mocks.save }));
vi.mock("./rate-limit", () => ({ allowRequest: mocks.limit }));
vi.mock("../db/repository.public-limits", () => ({ getPublicLimitOptionById: mocks.record }));
vi.mock("../db/repository.sponsorships", () => ({ listSponsorableCategories: mocks.categories }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "192.0.2.5" }) }));
import { submitRegularSponsorship } from "../../app/sponsor/regular-actions";
function form(scope = "REGISTRY") { const data = new FormData(); Object.entries({ scope, name: "Test Person", sponsor: "Test Lab", sponsorUrl: "https://example.org", contactEmail: "hello@example.org", message: "Discuss a sponsorship placement for our research organisation." }).forEach(([key,value]) => data.set(key,value)); return data; }
beforeEach(() => { vi.resetAllMocks(); mocks.limit.mockResolvedValue(true); });
it("accepts a regular enquiry without bounty amount or award terms", async () => {
 expect(await submitRegularSponsorship(form())).toEqual({ success: true });
 expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ channel: "CONTACT", subject: "Regular sponsorship — Test Lab", message: expect.stringContaining("Registry-wide") }));
});
it("rejects unpublished records and unknown categories", async () => {
 const data=form("LIMIT");data.set("limitId","10000000-0000-4000-8000-000000000001");mocks.record.mockResolvedValue(null);
 expect((await submitRegularSponsorship(data)).error).toMatch(/published/);
 const category=form("CATEGORY");category.set("category","Unknown");mocks.categories.mockResolvedValue([]);
 expect((await submitRegularSponsorship(category)).error).toMatch(/category/);expect(mocks.save).not.toHaveBeenCalled();
});
it("resolves a selected record server-side and prevents writes when throttled", async () => {
 const data=form("LIMIT");data.set("limitId","10000000-0000-4000-8000-000000000001");mocks.record.mockResolvedValue({registryNumber:"LR-TEST",title:"Verified title"});
 expect(await submitRegularSponsorship(data)).toEqual({success:true});expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({message:expect.stringContaining("LR-TEST — Verified title")}));
 mocks.save.mockClear();mocks.limit.mockResolvedValue(false);expect((await submitRegularSponsorship(form())).error).toMatch(/Too many/);expect(mocks.save).not.toHaveBeenCalled();
});
it("fails safely on storage errors",async()=>{mocks.save.mockRejectedValue(new Error("private details"));expect((await submitRegularSponsorship(form())).error).toBe("Your enquiry could not be saved. Please try again shortly.");});
