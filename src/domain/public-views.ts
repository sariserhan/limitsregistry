import { z } from "zod";
export const viewRequestSchema = z.object({ kind: z.enum(["LIMIT", "CATEGORY", "BOUNTY"]), target: z.string().trim().min(1).max(200), receipt: z.uuid() }).superRefine((input, context) => {
  if (input.kind === "BOUNTY" && !z.uuid().safeParse(input.target).success) context.addIssue({ code: "custom", path: ["target"], message: "Invalid bounty." });
});
export type ViewKind = z.infer<typeof viewRequestSchema>["kind"];
