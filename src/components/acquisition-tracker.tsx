"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AcquisitionTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventName: "page_view", path: pathname, referrer: document.referrer || null }), keepalive: true }).catch(() => undefined);
  }, [pathname]);
  return null;
}
