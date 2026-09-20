"use server";
import { headers } from "next/headers";
import { requestSponsorship } from "../../src/db/repository.sponsorships";
import { SponsorshipError } from "../../src/domain/bounty-sponsorship";
import { clientIp } from "../../src/ops/client-ip";
import { allowRequest } from "../../src/ops/rate-limit";
export async function submitSponsorship(formData:FormData) {
  try {
    const ip = clientIp(new Request("https://limitsregistry.com/sponsor",{headers:await headers()}));
    if (!(await allowRequest(`sponsor-enquiry:${ip}`,10,60_000))) return {error:"Too many enquiries. Please wait a minute and try again."};
    await requestSponsorship(Object.fromEntries(formData));
    return {success:true};
  } catch(error) {
    return {error:error instanceof SponsorshipError ? error.message : "Your enquiry could not be saved. Please try again shortly."};
  }
}
