export const BOUNTY_STATUSES = ["UNVERIFIED", "VERIFIED", "REJECTED", "WITHDRAWN"] as const;
export type BountyStatus = (typeof BOUNTY_STATUSES)[number];
export const BOUNTY_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY", "INR", "BTC", "ETH"] as const;
export function validateBountyInput(input: { title: string; sponsor: string; description: string; sourceUrl: string; amount?: string | null; currency?: string | null; expiresAt?: Date | null }, now = new Date()) {
  if (input.title.trim().length < 3 || input.title.trim().length > 200) return "Title must contain 3–200 characters.";
  if (input.sponsor.trim().length < 2 || input.sponsor.trim().length > 160) return "Sponsor must contain 2–160 characters.";
  if (input.description.trim().length < 20 || input.description.trim().length > 5000) return "Description must contain 20–5000 characters.";
  try { const url = new URL(input.sourceUrl); if (url.protocol !== "https:" || url.username || url.password) return "Source URL must be a credential-free HTTPS URL."; } catch { return "Source URL must be a valid HTTPS URL."; }
  const amount = input.amount?.trim() || null, currency = input.currency?.trim().toUpperCase() || null;
  if (Boolean(amount) !== Boolean(currency)) return "Amount and currency must be provided together.";
  if (amount && (!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(amount) || Number(amount) <= 0)) return "Amount must be a positive number with at most two decimal places.";
  if (currency && !/^[A-Z]{3}$/.test(currency)) return "Currency must be a three-letter code.";
  if (input.expiresAt && (!Number.isFinite(input.expiresAt.getTime()) || input.expiresAt <= now)) return "Expiration must be in the future.";
  return null;
}
export function isPublicBounty(status: string, expiresAt: Date | null, now = new Date()) { return status === "VERIFIED" && (!expiresAt || expiresAt > now); }
