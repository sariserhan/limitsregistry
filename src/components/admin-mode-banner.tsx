"use client";

import Link from "next/link";
import { useSession } from "../auth/client";
import { hasRole, type Role } from "../auth/permissions";

// Purely a shortcut, not access control: /admin does its own server-side role check. Client-side
// so that showing it to admins doesn't make every public page uncacheable for everyone else.
export function AdminModeBanner() {
  const { data: session } = useSession();
  if (!hasRole((session?.user as { role?: Role } | undefined)?.role, "ADMIN")) return null;
  return <Link href="/admin" prefetch={false} className="admin-mode-banner">
    <span className="admin-mode-label">Admin</span>
    <span>Admin mode — go to dashboard</span>
    <span className="admin-mode-arrow" aria-hidden="true">→</span>
  </Link>;
}
