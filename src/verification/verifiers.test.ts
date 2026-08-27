import { describe, expect, it } from "vitest";
import { verify } from "./verifiers";
describe("safe verification boundary", () => { it("accepts exact matches", () => expect(verify("EXACT_VALUE", { expected: 4, actual: 4 }).status).toBe("PASSED")); it("rejects oversized searches", () => expect(verify("BOUNDED_INTEGER_SEARCH", { lower: 0, upper: 1000001 }).status).toBe("REJECTED")); });
