"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createInboxMessage } from "../../../src/db/repository.inbox";
import { clientIp } from "../../../src/ops/client-ip";
import { allowRequest } from "../../../src/ops/rate-limit";

const requestSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.email().max(254),
  organization: z.string().trim().min(1).max(200),
  useCase: z.string().trim().min(20).max(4000),
  volume: z.string().trim().min(1).max(500),
  freshness: z.string().trim().min(1).max(500),
});

export async function requestApiAccess(formData: FormData) {
  const input = requestSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Complete every field, use a valid email, and describe your intended use in at least 20 characters." };
  try {
    const ip = clientIp(new Request("https://limitsregistry.com/developers/request", { headers: await headers() }));
    // Share the contact inbox allowance so this form cannot bypass its limit.
    if (!(await allowRequest(`inbox:CONTACT:${ip}`, 5, 3_600_000))) return { error: "Too many messages sent recently. Please try again in an hour." };
    const { name, email, organization, useCase, volume, freshness } = input.data;
    await createInboxMessage({
      channel: "CONTACT", name, email,
      subject: `API pilot request — ${organization}`,
      message: `Organisation: ${organization}\n\nIntended use:\n${useCase}\n\nExpected data volume / download frequency:\n${volume}\n\nFreshness requirements:\n${freshness}`,
    });
    return { success: true };
  } catch {
    return { error: "Your request could not be saved. Please try again shortly." };
  }
}
