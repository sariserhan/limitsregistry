import { createHmac, timingSafeEqual } from "node:crypto";
function secret() { const value = process.env.WATCHLIST_SECRET ?? process.env.CRON_SECRET; if (!value || value.length < 32) throw new Error("WATCHLIST_SECRET (or CRON_SECRET) must be at least 32 characters."); return value; }
export function signUnsubscribe(followId: string, email: string) { return createHmac("sha256", secret()).update(`${followId}:${email.toLowerCase()}`).digest("base64url"); }
export function verifyUnsubscribe(followId: string, email: string, token: string) { const expected = signUnsubscribe(followId, email); if (token.length !== expected.length) return false; return timingSafeEqual(Buffer.from(token), Buffer.from(expected)); }
