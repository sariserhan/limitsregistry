import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { afterAll, describe, expect, it, vi } from "vitest";
import { eq, inArray } from "drizzle-orm";
import * as schema from "./schema";
vi.mock("server-only", () => ({}));
const url = process.env.PUBLIC_VIEWS_TEST_DATABASE_URL;
const client = url ? postgres(url, { max: 5, prepare: false }) : null;
const database = client ? drizzle(client, { schema }) : null;
vi.mock("./client", () => ({ get db() { return database; } }));
afterAll(async () => { await client?.end(); });
describe.skipIf(!client)("public view counters", () => {
  it("counts refreshes atomically, deduplicates retries, keeps scopes separate and rejects private targets", async () => {
    const { recordPublicView, prunePublicViewReceipts } = await import("./repository.public-views");
    const id = randomUUID(), bountyId = randomUUID(), hiddenId = randomUUID(), oldReceipt = randomUUID();
    const registry = `LR-VIEW-${id}`, category = `View category ${id}`;
    const receipts: string[] = [oldReceipt];
    const hit = (kind: "LIMIT" | "CATEGORY" | "BOUNTY", target: string, receipt = randomUUID()) => { receipts.push(receipt); return recordPublicView({kind,target,receipt}); };
    await database!.insert(schema.limits).values({ id, registryNumber: registry, slug: registry.toLowerCase(), title: "View fixture", summary: "View fixture", category, direction: "MINIMIZE", metricName: "test", status: "OPEN" });
    await database!.insert(schema.researchBounties).values([{id:bountyId,limitId:id,title:"Public prize",sponsor:"Test",description:"Test bounty",sourceUrl:"https://example.test",status:"VERIFIED"},{id:hiddenId,limitId:id,title:"Private prize",sponsor:"Test",description:"Test bounty",sourceUrl:"https://example.test",status:"UNVERIFIED"}]);
    try {
      const receipt=randomUUID();
      const repeated=await Promise.all(Array.from({length:10},()=>hit("LIMIT",registry,receipt)));
      expect(repeated.every(result=>result?.views==="1")).toBe(true);
      await Promise.all(Array.from({length:15},()=>hit("LIMIT",registry)));
      expect((await hit("LIMIT",registry,receipt))?.views).toBe("16");
      expect((await hit("CATEGORY",category))?.views).toBe("1");
      expect((await hit("BOUNTY",bountyId))?.views).toBe("1");
      expect(await hit("BOUNTY",hiddenId)).toBeNull();
      expect(await hit("CATEGORY","missing category")).toBeNull();
      await database!.update(schema.limits).set({status:"DRAFT"}).where(eq(schema.limits.id,id));
      expect(await hit("LIMIT",registry)).toBeNull();
      expect(await hit("CATEGORY",category)).toBeNull();
      expect(await hit("BOUNTY",bountyId)).toBeNull();
      await database!.insert(schema.publicViewReceipts).values({id:oldReceipt,createdAt:new Date(Date.now()-49*3600000)});
      await prunePublicViewReceipts();
      expect(await database!.select().from(schema.publicViewReceipts).where(eq(schema.publicViewReceipts.id,oldReceipt))).toHaveLength(0);
      expect((await database!.select().from(schema.publicViewCounts).where(eq(schema.publicViewCounts.target,registry)))[0].views).toBe(16n);
    } finally {
      await database!.delete(schema.publicViewReceipts).where(inArray(schema.publicViewReceipts.id,receipts));
      await database!.delete(schema.publicViewCounts).where(inArray(schema.publicViewCounts.target,[registry,category,bountyId,hiddenId]));
      await database!.delete(schema.researchBounties).where(inArray(schema.researchBounties.id,[bountyId,hiddenId]));
      await database!.delete(schema.limits).where(eq(schema.limits.id,id));
    }
  });
});
