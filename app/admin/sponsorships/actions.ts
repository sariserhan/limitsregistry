"use server";
import { requireRole } from "../../../src/auth/session";
import { changeSponsorship } from "../../../src/db/repository.sponsorships";
import { SponsorshipError } from "../../../src/domain/bounty-sponsorship";
import { revalidatePath } from "next/cache";
export async function manageSponsorship(form:FormData) {
  const session=await requireRole("ADMIN");
  try {
    const raw=Object.fromEntries(form);
    // The form labels these explicitly as UTC; never interpret them in the server's local zone.
    if(raw.action==="pay") for(const field of ["startsAt","endsAt"]) {
      const value=raw[field];
      if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return {error:"Enter both dates in UTC."};
      raw[field]=`${value}:00Z`;
    }
    await changeSponsorship(String(form.get("id")??""),raw,session.user.id);
  }catch(error){return {error:error instanceof SponsorshipError?error.message:"Could not save the change. Please retry."};}
  revalidatePath("/admin/sponsorships");revalidatePath("/limits/[id]","page");
  return {success:true};
}
