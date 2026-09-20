import { z } from "zod";
import { isPublicBounty } from "./bounties";

export const SPONSORSHIP_DAYS = 90;
export const PUBLIC_LIMIT_STATUSES = ["OPEN", "PROVEN", "DISPUTED", "RETIRED"] as const;
export const httpsUrl = z.string().trim().max(2000).refine(value => {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !/\s/.test(value); } catch { return false; }
}, "Use a credential-free HTTPS URL.");
const amount = z.string().trim().regex(/^\d{1,8}(?:\.\d{1,2})?$/).refine(value => Number(value) > 0, "Amount must be positive and below 100 million.");
export const invoiceSchema = z.object({ feeAmount: amount, feeCurrency: z.string().trim().regex(/^[A-Z]{3}$/), invoiceReference: z.string().trim().min(1).max(200) });
export const sponsorshipRequestSchema = z.object({
  scope:z.enum(["LIMIT","CATEGORY"]).default("LIMIT"), limitId:z.union([z.uuid(),z.literal("")]).optional(), category:z.string().trim().max(200).optional(), title:z.string().trim().min(3).max(200), sponsor:z.string().trim().min(2).max(160),
  description:z.string().trim().min(20).max(5000), sourceUrl:httpsUrl, amount, currency:z.string().regex(/^[A-Z]{3}$/),
  sponsorUrl:httpsUrl, contactEmail:z.email().max(254), expiresAt:z.union([z.literal(""),z.iso.date()]), acknowledgement:z.literal("on"),
}).superRefine((value,ctx)=>{
  if(value.scope === "LIMIT" ? !value.limitId || !!value.category : !value.category || !!value.limitId) ctx.addIssue({code:"custom",message:"Choose exactly one published Limit or category."});
});
export class SponsorshipError extends Error {}
export function hasActiveSponsorship(term: {status:string; startsAt:Date|null; endsAt:Date|null}, bountyStatus:string, bountyExpiresAt:Date|null, limitStatus:string, now=new Date()) {
  return term.status === "PAID" && !!term.startsAt && !!term.endsAt && term.startsAt <= now && now < term.endsAt && isPublicBounty(bountyStatus,bountyExpiresAt,now) && (PUBLIC_LIMIT_STATUSES as readonly string[]).includes(limitStatus);
}
export function validateWindow(start:Date,end:Date,expires:Date|null) {
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return "End must be after start.";
  if (expires && end > expires) return "Sponsorship must end on or before the bounty expires.";
  return null;
}
