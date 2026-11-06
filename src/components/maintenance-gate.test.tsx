import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaintenanceGate } from "./maintenance-gate";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const render = (enabled: boolean) => renderToStaticMarkup(
  <MaintenanceGate enabled={enabled} message="Back soon" announcement={<p>Notice</p>}><p>Page</p></MaintenanceGate>,
);

describe("MaintenanceGate", () => {
  beforeEach(() => { pathname.current = "/"; });

  it("shows the page and announcement when maintenance is off", () => {
    expect(render(false)).toBe("<p>Notice</p><p>Page</p>");
  });

  it("replaces public pages, announcement included, during maintenance", () => {
    const html = render(true);
    expect(html).toContain("Back soon");
    expect(html).not.toContain("Page");
    expect(html).not.toContain("Notice");
  });

  it.each(["/login", "/admin", "/admin/settings"])("keeps %s reachable so admins can't lock themselves out", (path) => {
    pathname.current = path;
    expect(render(true)).toContain("Page");
  });

  it("does not bypass paths that merely start with a bypass word", () => {
    pathname.current = "/administrators";
    expect(render(true)).not.toContain("Page");
  });
});
