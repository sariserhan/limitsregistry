import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../lib/email/auth-emails";

function createAuth() {
  // Vercel can retain an old or missing BETTER_AUTH_URL across deployments. In production,
  // pin the session origin to the canonical site so auth cookies and redirects never target
  // localhost (which creates a successful-login-then-bounce loop).
  const baseURL = process.env.VERCEL_ENV === "production"
    ? "https://www.limitsregistry.com"
    : process.env.BETTER_AUTH_URL;
  return betterAuth({
    baseURL,
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      // Sending a verification email is not the same as requiring it — without this,
      // anyone can sign in immediately with an email address they don't own.
      // In local dev without RESEND_API_KEY, verify a test user directly:
      // `update "user" set email_verified = true where email = '...'`.
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => sendResetPasswordEmail(user.email, user.name, url),
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => sendVerificationEmail(user.email, user.name, url),
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      afterEmailVerification: async (user) => sendWelcomeEmail(user.email, user.name),
    },
    user: {
      additionalFields: {
        role: { type: ["USER", "RESEARCHER", "REVIEWER", "EDITOR", "ADMIN", "SUPERADMIN"], required: false, defaultValue: "USER", input: false },
      },
    },
    plugins: [nextCookies()],
  });
}

// betterAuth(...) touches the Drizzle db (via drizzleAdapter) the moment it's
// constructed. db.ts throws a placeholder error when DATABASE_URL is unset so
// Next.js can still collect page data for routes that don't need it at build
// time — constructing auth eagerly at module scope would defeat that here.
// Deferred to first real request, never during that build-time collection.
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!instance) instance = createAuth();
  return instance;
}
