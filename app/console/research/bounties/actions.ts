"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../../src/auth/session";
import { createBounty, moderateBounty } from "../../../../src/db/repository.research";
const done=(message:string,error=false):never=>redirect(`/console/research/bounties?${error?"error":"success"}=${encodeURIComponent(message)}`);
// done() on the success path must run OUTSIDE the try — it calls redirect(), which throws by
// design, and a redirect thrown from inside a try is caught by its own catch and misreported
// as an error (the thrown error's .message is literally "NEXT_REDIRECT").
export async function submitBounty(formData:FormData){const session=await requireRole("RESEARCHER");try{const expires=String(formData.get("expiresAt")??"");await createBounty({limitId:String(formData.get("limitId")??""),title:String(formData.get("title")??""),sponsor:String(formData.get("sponsor")??""),description:String(formData.get("description")??""),sourceUrl:String(formData.get("sourceUrl")??""),amount:String(formData.get("amount")??"")||null,currency:String(formData.get("currency")??"")||null,expiresAt:expires?new Date(`${expires}T23:59:59Z`):null,submittedByUserId:session.user.id});revalidatePath("/console/research/bounties");}catch(error){done(error instanceof Error?error.message:"Bounty could not be submitted.",true)}done("Bounty submitted for verification.");}
export async function decideBounty(formData:FormData){const session=await requireRole("EDITOR");const decision=String(formData.get("decision")??"");if(!["VERIFIED","REJECTED","WITHDRAWN"].includes(decision))done("Invalid moderation decision.",true);try{await moderateBounty({id:String(formData.get("id")??""),decision:decision as "VERIFIED"|"REJECTED"|"WITHDRAWN",note:String(formData.get("note")??""),actorUserId:session.user.id});revalidatePath("/console/research/bounties");revalidatePath("/bounties");revalidatePath("/limits","layout");}catch(error){done(error instanceof Error?error.message:"Decision could not be saved.",true)}done(`Bounty ${decision.toLowerCase()}.`);}
