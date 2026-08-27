import { describe, expect, it } from "vitest";
import { getPublishedLimit } from "./published";
describe("published frontier status", () => { it("keeps the plane chromatic number open at 5 to 7", () => { const limit = getPublishedLimit("LR-000072"); expect(limit?.frontier.lowerBound).toEqual({ kind: "integer", value: 5n }); expect(limit?.frontier.upperBound).toEqual({ kind: "integer", value: 7n }); expect(limit?.status).toBe("OPEN"); expect(limit?.frontier.status).toBe("OPEN"); }); });
