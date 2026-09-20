import { createHash, randomBytes } from "node:crypto";

export function hashApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function newApiKey() {
  const plaintext = `lr_live_${randomBytes(32).toString("base64url")}`;
  return { plaintext, keyHash: hashApiKey(plaintext), keyPrefix: plaintext.slice(0, 16) };
}
export function bearerApiKey(request: Request) {
  const match = request.headers.get("authorization")?.match(/^Bearer (lr_live_[A-Za-z0-9_-]{43})$/i);
  return match?.[1] ?? null;
}
