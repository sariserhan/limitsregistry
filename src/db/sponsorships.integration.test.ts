import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { afterAll, describe, expect, it, vi } from "vitest";
import { eq, inArray } from "drizzle-orm";
import * as schema from "./schema";
vi.mock("server-only",()=>({}));
const url=process.env.SPONSORSHIP_TEST_DATABASE_URL;
const client=url?postgres(url,{max:5,prepare:false}):null;
const database=client?drizzle(client,{schema}):null;
vi.mock("./client",()=>({get db(){return database;}}));
afterAll(async()=>{await client?.end();});
describe.skipIf(!client)("sponsorship PostgreSQL workflow",()=>{
  it("keeps payment separate from moderation, renews without losing history, and expires without cron",async()=>{
    const {requestSponsorship,changeSponsorship,listActiveSponsorPlacements,lapseSponsorships}=await import("./repository.sponsorships");
    const limitId=randomUUID(),actor=randomUUID();let bountyId="";const termIds:string[]=[];
    await database!.insert(schema.user).values({id:actor,name:"Sponsor admin test",email:`${actor}@example.test`,role:"ADMIN"});
    await database!.insert(schema.limits).values({id:limitId,registryNumber:`LR-SPONSOR-${limitId}`,slug:`sponsor-${limitId}`,title:"Sponsorship test",summary:"Test",category:"test",direction:"MINIMIZE",metricName:"test",status:"OPEN"});
    try {
      const request=await requestSponsorship({limitId,title:"Test research prize",sponsor:"Research foundation",description:"Official terms for this research award.",sourceUrl:"https://example.test/terms",amount:"10000",currency:"USD",sponsorUrl:"https://example.test",contactEmail:"private@example.test",expiresAt:"",acknowledgement:"on"});termIds.push(request.id);
      const [term]=await database!.select().from(schema.bountySponsorships).where(eq(schema.bountySponsorships.id,request.id));bountyId=term.bountyId;
      const invoice={action:"invoice",feeAmount:"250",feeCurrency:"USD",invoiceReference:"PRIVATE-INVOICE-123"};
      await expect(changeSponsorship(term.id,invoice,actor)).rejects.toThrow(/editorial/);
      expect(await listActiveSponsorPlacements(limitId)).toEqual([]);
      await database!.update(schema.researchBounties).set({status:"VERIFIED"}).where(eq(schema.researchBounties.id,bountyId));
      await changeSponsorship(term.id,invoice,actor);
      const start=new Date(Date.now()-60000),end=new Date(Date.now()+86400000);
      await changeSponsorship(term.id,{action:"pay",startsAt:start,endsAt:end},actor);
      const placements=await listActiveSponsorPlacements(limitId);
      expect(placements).toHaveLength(1);expect(JSON.stringify(placements)).not.toMatch(/private@example|PRIVATE-INVOICE|feeAmount|contactEmail/);
      expect(await listActiveSponsorPlacements(limitId,end)).toEqual([]);
      await database!.update(schema.limits).set({status:"DRAFT"}).where(eq(schema.limits.id,limitId));
      expect(await listActiveSponsorPlacements(limitId)).toEqual([]);
      await database!.update(schema.limits).set({status:"OPEN"}).where(eq(schema.limits.id,limitId));
      const attempts=await Promise.allSettled([changeSponsorship(term.id,{action:"renew"},actor),changeSponsorship(term.id,{action:"renew"},actor)]);
      expect(attempts.filter(a=>a.status==="fulfilled")).toHaveLength(1);
      const renewal=attempts.find(a=>a.status==="fulfilled")! as PromiseFulfilledResult<typeof term>;termIds.push(renewal.value.id);
      await changeSponsorship(renewal.value.id,{...invoice,invoiceReference:"RENEWAL"},actor);
      await expect(changeSponsorship(renewal.value.id,{action:"pay",startsAt:start,endsAt:end},actor)).rejects.toThrow(/overlaps/);
      await changeSponsorship(renewal.value.id,{action:"pay",startsAt:end,endsAt:new Date(end.getTime()+86400000)},actor);
      expect(await listActiveSponsorPlacements(limitId)).toHaveLength(1);
      expect(await lapseSponsorships(end)).toBeGreaterThanOrEqual(1);
      expect(await lapseSponsorships(end)).toBe(0);
      await changeSponsorship(renewal.value.id,{action:"cancel",note:"Sponsor cancelled this future placement."},actor);
      expect(await listActiveSponsorPlacements(limitId,end)).toEqual([]);
      await changeSponsorship(renewal.value.id,{action:"refund",note:"Full refund completed outside the registry.",refundReference:"REFUND-1"},actor);
      await expect(changeSponsorship(renewal.value.id,{action:"refund",note:"Duplicate refund record should fail.",refundReference:"REFUND-2"},actor)).rejects.toThrow();
      const [old]=await database!.select().from(schema.bountySponsorships).where(eq(schema.bountySponsorships.id,term.id));
      expect(old.invoiceReference).toBe(invoice.invoiceReference);expect(old.status).toBe("LAPSED");
      const replacement=await changeSponsorship(renewal.value.id,{action:"renew"},actor);termIds.push(replacement.id);
      await changeSponsorship(replacement.id,{...invoice,invoiceReference:"REPLACEMENT"},actor);
      await expect(changeSponsorship(replacement.id,{action:"pay",startsAt:start,endsAt:end},actor)).rejects.toThrow(/overlaps/);
      await changeSponsorship(replacement.id,{action:"pay",startsAt:end,endsAt:new Date(end.getTime()+86400000)},actor);
      const logs=await database!.select().from(schema.auditLogs).where(inArray(schema.auditLogs.entityId,termIds));
      expect(JSON.stringify(logs)).not.toMatch(/private@example|PRIVATE-INVOICE|feeAmount|contactEmail|REFUND-1/);
      for(const values of [{startsAt:start,endsAt:null},{status:"PAID",paidAt:null},{feeAmount:"999999999"},{contactEmail:"bad"},{sponsorUrl:"https://u:p@example.test"}]) {
        await expect(database!.update(schema.bountySponsorships).set(values).where(eq(schema.bountySponsorships.id,term.id))).rejects.toThrow();
      }
    }finally{
      if(termIds.length)await database!.delete(schema.auditLogs).where(inArray(schema.auditLogs.entityId,termIds));
      if(bountyId){await database!.delete(schema.bountySponsorships).where(eq(schema.bountySponsorships.bountyId,bountyId));await database!.delete(schema.researchBounties).where(eq(schema.researchBounties.id,bountyId));}
      await database!.delete(schema.limits).where(eq(schema.limits.id,limitId));await database!.delete(schema.user).where(eq(schema.user.id,actor));
    }
  });
  it("sponsors a whole category under one invoice with live published membership",async()=>{
    const {requestSponsorship,changeSponsorship,listActiveSponsorPlacements,listActiveCategorySponsorPlacements}=await import("./repository.sponsorships");
    const {moderateBounty,listPublicBounties,listPublicBountyArchive}=await import("./repository.research");
    const ids=Array.from({length:4},()=>randomUUID()),actor=randomUUID(),category=`Category-${randomUUID()}`;
    let termId="",bountyId="";
    await database!.insert(schema.user).values({id:actor,name:"Category test editor",email:`${actor}@example.test`,role:"ADMIN"});
    await database!.insert(schema.limits).values(ids.map((id,index)=>({id,registryNumber:`LR-CATEGORY-${id}`,slug:id,title:"Category test record",summary:"Test",category:index===3?`${category}-outside`:category,direction:"MINIMIZE" as const,metricName:"test",status:index===2?"DRAFT" as const:"OPEN" as const})));
    const input={scope:"CATEGORY",category,title:"Shared category prize",sponsor:"Category foundation",description:"One shared award pool across this entire category.",sourceUrl:"https://example.test/terms",amount:"50000",currency:"USD",sponsorUrl:"https://example.test",contactEmail:"category-private@example.test",expiresAt:"",acknowledgement:"on"};
    try {
      await expect(requestSponsorship({...input,category:"nonexistent category"})).rejects.toThrow(/published/);
      const term=await requestSponsorship(input);termId=term.id;
      const [stored]=await database!.select().from(schema.bountySponsorships).where(eq(schema.bountySponsorships.id,termId));bountyId=stored.bountyId;
      const [bounty]=await database!.select().from(schema.researchBounties).where(eq(schema.researchBounties.id,bountyId));
      expect(bounty.limitId).toBeNull();expect(bounty.category).toBe(category);expect(bounty.status).toBe("UNVERIFIED");
      await expect(database!.update(schema.researchBounties).set({limitId:ids[0]}).where(eq(schema.researchBounties.id,bountyId))).rejects.toThrow();
      const invoice={action:"invoice",feeAmount:"750",feeCurrency:"USD",invoiceReference:"ONE-CATEGORY-INVOICE"};
      await expect(changeSponsorship(termId,invoice,actor)).rejects.toThrow(/editorial/);
      await moderateBounty({id:bountyId,decision:"VERIFIED",note:"Verified category-wide award terms and shared pool.",actorUserId:actor});
      await changeSponsorship(termId,invoice,actor);
      const end=new Date(Date.now()+86400000);
      await changeSponsorship(termId,{action:"pay",startsAt:new Date(Date.now()-60000),endsAt:end},actor);
      expect(await listActiveSponsorPlacements(ids[0])).toHaveLength(1);expect(await listActiveSponsorPlacements(ids[1])).toHaveLength(1);
      expect(await listActiveSponsorPlacements(ids[2])).toHaveLength(0);expect(await listActiveSponsorPlacements(ids[3])).toHaveLength(0);
      expect(await listActiveCategorySponsorPlacements(category)).toHaveLength(1);
      expect((await listPublicBountyArchive()).filter(row=>row.bounty.id===bountyId)).toHaveLength(1);
      expect((await listPublicBounties(ids[0])).map(row=>row.bounty.id)).toContain(bountyId);
      await database!.update(schema.limits).set({status:"OPEN"}).where(eq(schema.limits.id,ids[2]));
      expect(await listActiveSponsorPlacements(ids[2])).toHaveLength(1);
      await database!.update(schema.limits).set({category:`${category}-outside`}).where(eq(schema.limits.id,ids[1]));
      expect(await listActiveSponsorPlacements(ids[1])).toHaveLength(0);
      expect(await listActiveCategorySponsorPlacements(category,end)).toHaveLength(0);
      await moderateBounty({id:bountyId,decision:"WITHDRAWN",note:"Category award terms have been withdrawn.",actorUserId:actor});
      expect(await listActiveSponsorPlacements(ids[0])).toHaveLength(0);expect(await listActiveCategorySponsorPlacements(category)).toHaveLength(0);
      await changeSponsorship(termId,{action:"cancel",note:"Cancelled the whole category sponsorship."},actor);
      expect((await database!.select().from(schema.bountySponsorships).where(eq(schema.bountySponsorships.bountyId,bountyId)))).toHaveLength(1);
    }finally{
      await database!.delete(schema.auditLogs).where(inArray(schema.auditLogs.entityId,[termId,bountyId]));
      if(termId)await database!.delete(schema.bountySponsorships).where(eq(schema.bountySponsorships.id,termId));
      if(bountyId)await database!.delete(schema.researchBounties).where(eq(schema.researchBounties.id,bountyId));
      await database!.delete(schema.limits).where(inArray(schema.limits.id,ids));await database!.delete(schema.user).where(eq(schema.user.id,actor));
    }
  });

});
