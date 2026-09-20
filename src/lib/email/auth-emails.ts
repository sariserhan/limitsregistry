import "server-only";
import { sendEmail, SENDERS } from "./resend";
import { escapeHtml, renderEmail } from "./template";

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const { html, text } = renderEmail({
    preheader: "Confirm your email address for Limits Registry.",
    heading: "Verify your email",
    intro: `Hi ${escapeHtml(name)}, confirm this is your email address to finish setting up your Limits Registry account.`,
    ctaLabel: "Verify email address",
    ctaUrl: url,
    note: "If you didn't create this account, you can safely ignore this email.",
  });
  await sendEmail({ to, from: SENDERS.support, replyTo: SENDERS.support, subject: "Verify your email — Limits Registry", html, text });
}

export async function sendResetPasswordEmail(to: string, name: string, url: string) {
  const { html, text } = renderEmail({
    preheader: "Reset your Limits Registry password.",
    heading: "Reset your password",
    intro: `Hi ${escapeHtml(name)}, we received a request to reset the password on your Limits Registry account. This link expires in 1 hour.`,
    ctaLabel: "Reset password",
    ctaUrl: url,
    note: "If you didn't request this, you can safely ignore this email — your password won't change.",
  });
  await sendEmail({ to, from: SENDERS.support, replyTo: SENDERS.support, subject: "Reset your password — Limits Registry", html, text });
}

const SIGNUP_NOTIFICATION_RECIPIENT = "serhan.sari@yahoo.com";

/** Internal alert, not a user-facing transactional email — fires once per new account. */
export async function sendSignupNotificationEmail(user: { name: string; email: string; createdAt?: Date }) {
  const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const when = (user.createdAt ?? new Date()).toISOString();
  const { html, text } = renderEmail({
    preheader: `${user.name} just signed up for Limits Registry.`,
    heading: "New account signed up",
    intro: `Name: ${escapeHtml(user.name)}<br/>Email: ${escapeHtml(user.email)}<br/>Signed up: ${escapeHtml(when)}`,
    ctaLabel: "View users in admin",
    ctaUrl: `${siteUrl}/admin`,
  });
  await sendEmail({ to: SIGNUP_NOTIFICATION_RECIPIENT, from: SENDERS.support, subject: `New signup: ${user.name} — Limits Registry`, html, text });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const { html, text } = renderEmail({
    preheader: "Your Limits Registry account is verified.",
    heading: `Welcome, ${escapeHtml(name)}`,
    intro: "Your email is verified. New accounts start with read-only access — an admin grants Research Console and review permissions from there.",
    ctaLabel: "Explore the Registry",
    ctaUrl: siteUrl,
    note: "Questions about access? Reply to this email and it'll reach Support directly.",
  });
  await sendEmail({ to, from: SENDERS.welcome, replyTo: SENDERS.support, subject: "Welcome to Limits Registry", html, text });
}
