import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { sendResetPasswordEmail, sendVerificationEmail } from "../lib/email/auth-emails";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => sendResetPasswordEmail(user.email, user.name, url),
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => sendVerificationEmail(user.email, user.name, url),
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: { type: ["USER", "RESEARCHER", "REVIEWER", "EDITOR", "ADMIN", "SUPERADMIN"], required: false, defaultValue: "USER", input: false },
    },
  },
  plugins: [nextCookies()],
});
