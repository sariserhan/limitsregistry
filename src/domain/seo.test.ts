import { describe, expect, it } from "vitest";
import { absoluteUrl, pageMetadata, SITE_URL } from "./seo";

describe("absoluteUrl", () => {
  it("puts every path on the www origin", () => {
    expect(SITE_URL).toBe("https://www.limitsregistry.com");
    expect(absoluteUrl("/limits/LR-000001")).toBe("https://www.limitsregistry.com/limits/LR-000001");
    expect(absoluteUrl("categories/physics")).toBe("https://www.limitsregistry.com/categories/physics");
  });

  it("uses the bare origin for the homepage, matching the sitemap", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL);
    expect(absoluteUrl("")).toBe(SITE_URL);
  });
});

describe("pageMetadata", () => {
  it("keeps canonical and og:url identical", () => {
    const metadata = pageMetadata({ path: "/categories/physics?page=2", title: "Physics — page 2", description: "All Physics records." });
    expect(metadata.alternates?.canonical).toBe("https://www.limitsregistry.com/categories/physics?page=2");
    expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
    expect(metadata.openGraph?.title).toBe("Physics — page 2");
    expect(metadata.description).toBe("All Physics records.");
  });

  it("omits description fields when none is given", () => {
    const metadata = pageMetadata({ path: "/sponsor", title: "Sponsor" });
    expect(metadata).not.toHaveProperty("description");
    expect(metadata.openGraph).not.toHaveProperty("description");
  });
});
