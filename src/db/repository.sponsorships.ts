import "server-only";
import { and, desc, eq, gt, inArray, lt, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { bountyCoversLimit } from "./bounty-scope";
import { db } from "./client";
import { auditLogs, bountySponsorships as terms, limits, researchBounties as bounties } from "./schema";
import { hasActiveSponsorship, invoiceSchema, PUBLIC_LIMIT_STATUSES, sponsorshipRequestSchema, SponsorshipError, validateWindow } from "../domain/bounty-sponsorship";
import { isPublicBounty, validateBountyInput } from "../domain/bounties";

export async function requestSponsorship(raw: unknown) {
  const parsed = sponsorshipRequestSchema.safeParse(raw);
  if (!parsed.success) throw new SponsorshipError("Check all fields: valid HTTPS links, contact email, positive amounts below 100 million, and the acknowledgement are required.");
  const { sponsorUrl, contactEmail, expiresAt: expiry, ...rest } = parsed.data;
  const { title, sponsor, description, sourceUrl, amount, currency } = rest;
  const limitId = rest.scope === "LIMIT" ? rest.limitId! : null;
  const category = rest.scope === "CATEGORY" ? rest.category! : null;
  const input = { limitId, category, title, sponsor, description, sourceUrl, amount, currency };
  const expiresAt = expiry ? new Date(`${expiry}T23:59:59.999Z`) : null;
  const error = validateBountyInput({...input,expiresAt});
  if (error) throw new SponsorshipError(error);
  return db.transaction(async tx => {
    const [limit] = await tx.select({ id:limits.id }).from(limits).where(and(category ? eq(limits.category,category) : eq(limits.id,limitId!),inArray(limits.status,[...PUBLIC_LIMIT_STATUSES]))).limit(1);
    if (!limit) throw new SponsorshipError("Choose a category containing published Limits, or a published Limit.");
    const [bounty] = await tx.insert(bounties).values({...input,expiresAt}).returning({id:bounties.id});
    const [term] = await tx.insert(terms).values({bountyId:bounty.id,sponsorUrl,contactEmail}).returning({id:terms.id});
    await tx.insert(auditLogs).values({action:"SPONSORSHIP_REQUESTED",entityType:"BOUNTY_SPONSORSHIP",entityId:term.id,after:{status:"REQUESTED",bountyId:bounty.id}});
    return term;
  });
}

export async function listSponsorships() {
  return db.select({term:terms,bounty:{id:bounties.id,title:bounties.title,category:bounties.category,sponsor:bounties.sponsor,status:bounties.status,expiresAt:bounties.expiresAt},limit:{registryNumber:limits.registryNumber,title:limits.title,status:limits.status}})
    .from(terms).innerJoin(bounties,eq(bounties.id,terms.bountyId)).leftJoin(limits,eq(limits.id,bounties.limitId)).orderBy(desc(terms.createdAt));
}

const commandSchema = z.discriminatedUnion("action",[
  invoiceSchema.extend({action:z.literal("invoice")}),
  z.object({action:z.literal("pay"),startsAt:z.coerce.date(),endsAt:z.coerce.date()}),
  z.object({action:z.literal("cancel"),note:z.string().trim().min(10).max(2000)}),
  z.object({action:z.literal("refund"),note:z.string().trim().min(10).max(2000),refundReference:z.string().trim().min(1).max(200)}),
  z.object({action:z.literal("renew")}),
]);
export async function changeSponsorship(id:string,raw:unknown,actorUserId:string) {
  const parsed = commandSchema.safeParse(raw);
  if (!z.uuid().safeParse(id).success || !parsed.success) throw new SponsorshipError("Check the identifier and required invoice, date, or resolution fields.");
  const command = parsed.data;
  return db.transaction(async tx => {
    // Serialize financial transitions, renewals and expiry, including overlapping future windows.
    await tx.execute(sql`select pg_advisory_xact_lock(7351772)`);
    const [current] = await tx.select().from(terms).where(eq(terms.id,id));
    if (!current) throw new SponsorshipError("Sponsorship not found.");
    const [bounty] = await tx.select().from(bounties).where(eq(bounties.id,current.bountyId)).for("update");
    const [limit] = await tx.select({status:limits.status}).from(limits).where(and(bounty.category ? eq(limits.category,bounty.category) : eq(limits.id,bounty.limitId!),inArray(limits.status,[...PUBLIC_LIMIT_STATUSES]))).limit(1);
    const now = new Date();
    const assertPublishable = () => {
      if (!limit || !(PUBLIC_LIMIT_STATUSES as readonly string[]).includes(limit.status) || !isPublicBounty(bounty.status,bounty.expiresAt,now)) throw new SponsorshipError("Independent editorial verification and an unexpired bounty on a published Limit are required first.");
    };
    if (command.action === "renew") {
      if (!current.paidAt) throw new SponsorshipError("Only a previously paid sponsorship can be renewed.");
      assertPublishable();
      const pending = await tx.select({id:terms.id}).from(terms).where(and(eq(terms.bountyId,current.bountyId),inArray(terms.status,["REQUESTED","INVOICED"])));
      if (pending.length) throw new SponsorshipError("This bounty already has a pending term. Use that request.");
      const [renewal] = await tx.insert(terms).values({bountyId:current.bountyId,sponsorUrl:current.sponsorUrl,contactEmail:current.contactEmail}).returning();
      await tx.insert(auditLogs).values({actorUserId,action:"SPONSORSHIP_RENEWED",entityType:"BOUNTY_SPONSORSHIP",entityId:renewal.id,before:{previousTermId:id},after:{status:"REQUESTED",bountyId:current.bountyId}});
      return renewal;
    }
    const update:Partial<typeof terms.$inferInsert> = {updatedAt:now};
    if (command.action === "invoice") {
      if (current.status !== "REQUESTED") throw new SponsorshipError("Only a requested term can be invoiced.");
      assertPublishable();
      Object.assign(update,{status:"INVOICED",feeAmount:command.feeAmount,feeCurrency:command.feeCurrency,invoiceReference:command.invoiceReference});
    } else if (command.action === "pay") {
      if (current.status !== "INVOICED") throw new SponsorshipError("Only an invoiced term can be marked paid.");
      assertPublishable();
      const error = validateWindow(command.startsAt,command.endsAt,bounty.expiresAt);
      if (error) throw new SponsorshipError(error);
      if (command.endsAt <= now) throw new SponsorshipError("The paid term must end in the future.");
      const overlaps = await tx.select({id:terms.id}).from(terms).where(and(eq(terms.bountyId,current.bountyId),inArray(terms.status,["PAID","LAPSED"]),lt(terms.startsAt,command.endsAt),gt(terms.endsAt,command.startsAt)));
      if (overlaps.length) throw new SponsorshipError("This period overlaps an existing paid term. Start the renewal at or after its end.");
      Object.assign(update,{status:"PAID",startsAt:command.startsAt,endsAt:command.endsAt,paidAt:now});
    } else if (command.action === "cancel") {
      if (!["REQUESTED","INVOICED","PAID","LAPSED"].includes(current.status)) throw new SponsorshipError("This term is already closed.");
      Object.assign(update,{status:"CANCELLED",resolutionNote:command.note});
    } else {
      if (!current.paidAt || !["PAID","LAPSED","CANCELLED"].includes(current.status)) throw new SponsorshipError("Only a paid, unrefunded term can record a refund.");
      Object.assign(update,{status:"REFUNDED",resolutionNote:command.note,refundReference:command.refundReference});
    }
    const [updated] = await tx.update(terms).set(update).where(eq(terms.id,id)).returning();
    // Financial values, private contact information, and free-text notes stay out of shared audits.
    await tx.insert(auditLogs).values({actorUserId,action:`SPONSORSHIP_${updated.status}`,entityType:"BOUNTY_SPONSORSHIP",entityId:id,before:{status:current.status},after:{status:updated.status}});
    return updated;
  });
}

export async function lapseSponsorships(now=new Date()) {
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(7351772)`);
    const expired = await tx.update(terms).set({status:"LAPSED",updatedAt:now}).where(and(eq(terms.status,"PAID"),lte(terms.endsAt,now))).returning({id:terms.id});
    if (expired.length) await tx.insert(auditLogs).values(expired.map(row=>({action:"SPONSORSHIP_LAPSED",entityType:"BOUNTY_SPONSORSHIP",entityId:row.id,before:{status:"PAID"},after:{status:"LAPSED"}})));
    return expired.length;
  });
}

// Deliberately uncached: cancellation, editorial withdrawal, and expiry apply on the next render.
export async function listActiveSponsorPlacements(limitId:string,now=new Date()) {
  const rows = await db.select({id:terms.id,bountyId:bounties.id,title:bounties.title,category:bounties.category,amount:bounties.amount,currency:bounties.currency,sourceUrl:bounties.sourceUrl,sponsor:bounties.sponsor,sponsorUrl:terms.sponsorUrl,status:terms.status,startsAt:terms.startsAt,endsAt:terms.endsAt,bountyStatus:bounties.status,bountyExpiresAt:bounties.expiresAt,limitStatus:limits.status})
    .from(terms).innerJoin(bounties,eq(bounties.id,terms.bountyId)).innerJoin(limits,bountyCoversLimit)
    .where(and(eq(limits.id,limitId),eq(terms.status,"PAID"),lte(terms.startsAt,now),gt(terms.endsAt,now))).orderBy(terms.startsAt);
  return rows.filter(row=>hasActiveSponsorship(row,row.bountyStatus,row.bountyExpiresAt,row.limitStatus,now))
    .map(({id,bountyId,title,category,amount,currency,sourceUrl,sponsor,sponsorUrl,endsAt})=>({id,bountyId,title,category,amount,currency,sourceUrl,sponsor,sponsorUrl,endsAt}));
}

export async function listSponsorableCategories() {
  return db.select({category:limits.category,count:sql<number>`count(*)::int`}).from(limits)
    .where(inArray(limits.status,[...PUBLIC_LIMIT_STATUSES])).groupBy(limits.category).orderBy(limits.category);
}

export async function listActiveCategorySponsorPlacements(category:string,now=new Date()) {
  // One representative published Limit lets us reuse the full live visibility predicate.
  const [limit]=await db.select({id:limits.id}).from(limits).where(and(eq(limits.category,category),inArray(limits.status,[...PUBLIC_LIMIT_STATUSES]))).limit(1);
  if(!limit)return [];
  return (await listActiveSponsorPlacements(limit.id,now)).filter(term=>term.category===category);
}
