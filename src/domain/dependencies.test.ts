import { describe, expect, it } from "vitest";
import { validateDependency } from "./dependencies";

describe("dependency validation", () => {
  it("rejects self edges and unsupported relations", () => {
    expect(validateDependency({ sourceLimitId: "A", targetLimitId: "A", relation: "REDUCES_TO" }, [])).toMatch(/itself/);
    expect(validateDependency({ sourceLimitId: "A", targetLimitId: "B", relation: "RELATED_TO" }, [])).toMatch(/Unsupported/);
  });
  it("rejects duplicate directed edges", () => expect(validateDependency({ sourceLimitId: "A", targetLimitId: "B", relation: "REDUCES_TO" }, [{ sourceLimitId: "A", targetLimitId: "B", relation: "REDUCES_TO", reviewStatus: "DRAFT" }])).toMatch(/already exists/));
  it("rejects direct and transitive cycles in their proposed direction", () => {
    const edges = [{ sourceLimitId: "A", targetLimitId: "B", relation: "REDUCES_TO", reviewStatus: "ACCEPTED" }, { sourceLimitId: "B", targetLimitId: "C", relation: "DEPENDS_ON", reviewStatus: "DRAFT" }];
    expect(validateDependency({ sourceLimitId: "C", targetLimitId: "A", relation: "REDUCES_TO" }, edges)).toMatch(/cycle/);
    expect(validateDependency({ sourceLimitId: "B", targetLimitId: "A", relation: "REDUCES_TO" }, edges)).toMatch(/cycle/);
  });
  it("ignores rejected edges and accepts an acyclic direction", () => expect(validateDependency({ sourceLimitId: "B", targetLimitId: "C", relation: "IMPROVES" }, [{ sourceLimitId: "C", targetLimitId: "B", relation: "IMPROVES", reviewStatus: "REJECTED" }])).toBeNull());
});
