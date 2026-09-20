import { expect, it } from "vitest";
import { bearerApiKey, hashApiKey, newApiKey } from "./key-token";
import { snapshotJson } from "./snapshot-format";

it("creates high-entropy keys, stores a hash and a non-secret identification prefix", () => {
  const key = newApiKey();
  expect(key.plaintext).toMatch(/^lr_live_[A-Za-z0-9_-]{43}$/);
  expect(key.keyHash).toBe(hashApiKey(key.plaintext));
  expect(key.keyPrefix).toBe(key.plaintext.slice(0, 16));
  expect(newApiKey().keyHash).not.toBe(key.keyHash);
  expect(bearerApiKey(new Request("http://localhost", { headers: { authorization: `Bearer ${key.plaintext}` } }))).toBe(key.plaintext);
  expect(bearerApiKey(new Request("http://localhost", { headers: { authorization: `Basic ${key.plaintext}` } }))).toBeNull();
});
it("preserves arbitrary precision values in snapshot JSON", () => {
  expect(JSON.parse(snapshotJson({ value: 123456789012345678901234567890n }))).toEqual({ value: "123456789012345678901234567890" });
});
