import "server-only";
import { sendEmail } from "./resend";
import { renderEmail } from "./template";

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const { html, text } = renderEmail({
    preheader: "Confirm your email address for Limits Registry.",
    heading: "Verify your email",
    intro: `Hi ${name}, confirm this is your email address to finish setting up your Limits Registry account.`,
    ctaLabel: "Verify email address",
    ctaUrl: url,
    note: "If you didn't create this account, you can safely ignore this email.",
  });
  await sendEmail({ to, subject: "Verify your email — Limits Registry", html, text });
}

export async function sendResetPasswordEmail(to: string, name: string, url: string) {
  const { html, text } = renderEmail({
    preheader: "Reset your Limits Registry password.",
    heading: "Reset your password",
    intro: `Hi ${name}, we received a request to reset the password on your Limits Registry account. This link expires in 1 hour.`,
    ctaLabel: "Reset password",
    ctaUrl: url,
    note: "If you didn't request this, you can safely ignore this email — your password won't change.",
  });
  await sendEmail({ to, subject: "Reset your password — Limits Registry", html, text });
}
