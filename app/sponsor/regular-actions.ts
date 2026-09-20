"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { httpsUrl } from "../../src/domain/bounty-sponsorship";
import { getPublicLimitOptionById } from "../../src/db/repository.public-limits";
import { listSponsorableCategories } from "../../src/db/repository.sponsorships";
import { createInboxMessage } from "../../src/db/repository.inbox";
import { allowRequest } from "../../src/ops/rate-limit";
import { clientIp } from "../../src/ops/client-ip";
const schema = z.object({ scope: z.enum(["REGISTRY", "LIMIT", "CATEGORY"]), name: z.string().trim().min(2).max(200), sponsor: z.string().trim().min(2).max(160), sponsorUrl: httpsUrl, contactEmail: z.email().max(254), message: z.string().trim().min(20).max(5000), limitId: z.uuid().optional(), category: z.string().trim().min(1).max(200).optional() });
export async function submitRegularSponsorship(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Complete the required details, use an HTTPS website, and describe your sponsorship in at least 20 characters." };
  try {
    const ip = clientIp(new Request("https://limitsregistry.com/sponsor", { headers: await headers() }));
    if (!(await allowRequest(`inbox:CONTACT:${ip}`, 5, 3_600_000))) return { error: "Too many enquiries. Please try again in an hour." };
    const input = parsed.data;
    let target = "Registry-wide / discuss options";
    if (input.scope === "LIMIT") {
      const limit = input.limitId ? await getPublicLimitOptionById(input.limitId) : null;
      if (!limit) return { error: "Choose a currently published Limit." };
      target = `${limit.registryNumber} — ${limit.title}`;
    } else if (input.scope === "CATEGORY") {
      if (!(await listSponsorableCategories()).some(item => item.category === input.category)) return { error: "Choose a category with published Limits." };
      target = `Entire category: ${input.category}`;
    }
    await createInboxMessage({ channel: "CONTACT", name: input.name, email: input.contactEmail, subject: `Regular sponsorship — ${input.sponsor}`, message: `Organisation: ${input.sponsor}\nWebsite: ${input.sponsorUrl}\nScope: ${target}\n\n${input.message}` });
    return { success: true };
  } catch { return { error: "Your enquiry could not be saved. Please try again shortly." }; }
}
