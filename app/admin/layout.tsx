import Link from "next/link";
import { requireRole } from "../../src/auth/session";
import { AdminTabs } from "./AdminTabs";
import "./admin.css";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole("ADMIN");

  return <main className="admin-shell">
    <Link href="/">&larr; Back to Registry</Link>
    <h1>Admin</h1>
    <p>Signed in as {session.user.email} · {session.user.role}.</p>
    <AdminTabs />
    <div className="admin-tab-content">{children}</div>
  </main>;
}
