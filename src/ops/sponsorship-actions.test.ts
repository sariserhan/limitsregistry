import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({request:vi.fn(),change:vi.fn(),limit:vi.fn(),role:vi.fn(),lapse:vi.fn()}));
vi.mock("../db/repository.sponsorships",()=>({requestSponsorship:mocks.request,changeSponsorship:mocks.change,lapseSponsorships:mocks.lapse}));
vi.mock("./rate-limit",()=>({allowRequest:mocks.limit}));
vi.mock("next/headers",()=>({headers:async()=>new Headers({"x-forwarded-for":"192.0.2.1"})}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
vi.mock("../auth/session",()=>({requireRole:mocks.role}));
import { submitSponsorship } from "../../app/sponsor/actions";
import { manageSponsorship } from "../../app/admin/sponsorships/actions";
import { GET } from "../../app/api/cron/bounty-sponsorships/route";
beforeEach(()=>{vi.resetAllMocks();vi.unstubAllEnvs();});
it("rejects the eleventh enquiry before any write",async()=>{
  let count=0;mocks.limit.mockImplementation(async()=>++count<=10);
  for(let i=0;i<10;i++)expect(await submitSponsorship(new FormData())).toEqual({success:true});
  expect((await submitSponsorship(new FormData())).error).toMatch(/Too many/);
  expect(mocks.request).toHaveBeenCalledTimes(10);
  expect(mocks.limit).toHaveBeenLastCalledWith("sponsor-enquiry:192.0.2.1",10,60000);
});
it("fails closed on rate limiter failure",async()=>{
  mocks.limit.mockRejectedValue(new Error("offline"));expect((await submitSponsorship(new FormData())).error).toBeTruthy();expect(mocks.request).not.toHaveBeenCalled();
});
it("enforces admin authentication before mutation",async()=>{
  mocks.role.mockRejectedValue(new Error("Forbidden"));await expect(manageSponsorship(new FormData())).rejects.toThrow("Forbidden");expect(mocks.role).toHaveBeenCalledWith("ADMIN");expect(mocks.change).not.toHaveBeenCalled();
});
it("protects the cron against missing secrets and invalid credentials",async()=>{
  expect((await GET(new Request("https://example.test"))).status).toBe(401);
  vi.stubEnv("CRON_SECRET","secret");
  expect((await GET(new Request("https://example.test",{headers:{authorization:"Bearer wrong"}}))).status).toBe(401);
  expect(mocks.lapse).not.toHaveBeenCalled();
  mocks.lapse.mockResolvedValue(2);const response=await GET(new Request("https://example.test",{headers:{authorization:"Bearer secret"}}));expect(await response.json()).toEqual({lapsed:2});
});
it("records admin payment windows as UTC and rejects missing dates",async()=>{
  mocks.role.mockResolvedValue({user:{id:"admin-test"}});
  const form=new FormData();form.set("id","10000000-0000-4000-8000-000000000025");form.set("action","pay");form.set("startsAt","2026-09-20T12:00");form.set("endsAt","2026-12-19T12:00");
  expect(await manageSponsorship(form)).toEqual({success:true});
  expect(mocks.change).toHaveBeenCalledWith("10000000-0000-4000-8000-000000000025",expect.objectContaining({startsAt:"2026-09-20T12:00:00Z",endsAt:"2026-12-19T12:00:00Z"}),"admin-test");
  mocks.change.mockClear();form.delete("startsAt");expect((await manageSponsorship(form)).error).toMatch(/UTC/);expect(mocks.change).not.toHaveBeenCalled();
});
