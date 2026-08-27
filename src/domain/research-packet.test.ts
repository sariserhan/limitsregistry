import { describe, expect, it } from "vitest";
import { deriveFrontier } from "./frontier";
import { planeColoringResearchPacket } from "./research-packet";

describe("LR-000072 normalized research packet", () => {
  it("keeps claim, evidence, and review dimensions orthogonal", () => {
    const { claims, evidence, specification, limit } = planeColoringResearchPacket;
    expect(claims.map((claim) => claim.claimType)).toEqual(["LOWER_BOUND", "UPPER_BOUND"]);
    expect(evidence.map((item) => item.type)).toEqual(["CONSTRUCTION", "CONSTRUCTION"]);
    expect(claims.every((claim) => claim.scientificStatus === "ACCEPTED")).toBe(true);
    expect(claims.every((claim) => claim.registryReviewStatus === "UNREVIEWED")).toBe(true);
    const frontier = deriveFrontier(limit.direction, specification, claims);
    expect(frontier.lowerBound).toEqual({ kind: "integer", value: 5n });
    expect(frontier.upperBound).toEqual({ kind: "integer", value: 7n });
    expect(frontier.gap).toBe("5 to 7");
    expect(frontier.status).toBe("OPEN");
  });
});
