import { describe, expect, it } from "vitest";
import { canonicalJson, hashCertificateSnapshot } from "./hash";
describe("certificate integrity", () => { it("canonicalizes object key order", () => expect(canonicalJson({ b: 2, a: 1 })).toBe(canonicalJson({ a: 1, b: 2 }))); it("produces a stable SHA-256 hash", () => expect(hashCertificateSnapshot({ claim: "CLM-1", value: "5" })).toHaveLength(64)); });
