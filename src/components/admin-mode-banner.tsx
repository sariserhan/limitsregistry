import Link from "next/link";

export function AdminModeBanner() {
  return <Link href="/admin" className="admin-mode-banner">
    <span className="admin-mode-label">Admin</span>
    <span>Admin mode — go to dashboard</span>
    <span className="admin-mode-arrow" aria-hidden="true">→</span>
  </Link>;
}
