import "server-only";
import { eq, or } from "drizzle-orm";
import { limits, researchBounties } from "./schema";
// Category membership is evaluated live. Drafts are excluded by each public caller.
export const bountyCoversLimit = or(eq(researchBounties.limitId, limits.id), eq(researchBounties.category, limits.category))!;
