import { describe, expect, it } from "vitest";
import { deriveFrontier } from "./frontier";
import { planeColoringResearchPacket } from "./research-packet";
import { cernyResearchPacket, capSetResearchPacket, bchResearchPacket } from "./research-packets";

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


describe("additional normalized research packets", () => {
  it("excludes the unproven Cerny conjecture from the frontier", () => {
    const frontier = deriveFrontier(cernyResearchPacket.limit.direction, cernyResearchPacket.specification, cernyResearchPacket.claims);
    expect(frontier.status).toBe("OPEN");
    expect(frontier.lowerBound).toEqual({ kind: "text", value: "(n−1)²" });
    expect(frontier.upperBound).toEqual({ kind: "text", value: "0.1654n³ + O(n²)" });
  });

  it("keeps cap sets and BCH as open, parameterized problems", () => {
    expect(deriveFrontier(capSetResearchPacket.limit.direction, capSetResearchPacket.specification, capSetResearchPacket.claims).status).toBe("OPEN");
    expect(bchResearchPacket.specification.constraints.parameter).toBe("m and δ");
  });
});
