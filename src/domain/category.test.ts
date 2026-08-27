import { describe, expect, it } from "vitest";
import { categoryForSlug, categorySlug } from "./category";

describe("category routes", () => {
  it("creates stable readable slugs", () => { expect(categorySlug("Data Storage")).toBe("data-storage"); expect(categorySlug("AI / Systems")).toBe("ai-systems"); });
  it("resolves only an existing category", () => { const categories=["Physics","Biology"]; expect(categoryForSlug(categories,"physics")).toBe("Physics"); expect(categoryForSlug(categories,"drafts")).toBeUndefined(); });
});
