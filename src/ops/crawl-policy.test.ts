import { describe, expect, it, vi } from "vitest";
import * as license from "../../app/license.xml/route";
import * as robots from "../../app/robots.txt/route";
import * as policy from "../../app/crawl-policy/route";

describe("public crawler notices", () => {
  it.each([
    [license, 'application/rsl+xml', '<amount currency="USD">0.01</amount>'],
    [robots, 'text/plain', 'License: https://www.limitsregistry.com/license.xml'],
    [policy, 'text/html', 'USD $0.01 per successful HTML page GET'],
  ] as const)("serves static notices without configuration or origin calls", async (route, contentType, text) => {
    const upstream = vi.fn(() => { throw Error("Database and upstream unavailable"); });
    vi.stubGlobal("fetch", upstream);
    try {
      const response = route.GET();
      expect(route.dynamic).toBe("force-static");
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(contentType);
      await expect(response.text()).resolves.toContain(text);
      expect(route.HEAD().body).toBeNull();
      expect(upstream).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });
});
