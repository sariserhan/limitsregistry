"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MaintenanceScreen } from "./maintenance-screen";

// Always allowed through, even during maintenance — otherwise an admin could lock themselves
// out with no way back in (can't sign in, can't reach /admin to turn it back off).
const MAINTENANCE_BYPASS_PREFIXES = ["/admin", "/login"];

/**
 * A client component so the root layout never has to read the request to learn the path: this
 * still server-renders the right output for each route, including when a page is cached.
 */
export function MaintenanceGate({ enabled, message, announcement, children }: { enabled: boolean; message: string | null; announcement: ReactNode; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const bypass = MAINTENANCE_BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (enabled && !bypass) return <MaintenanceScreen message={message} />;
  return <>{announcement}{children}</>;
}
