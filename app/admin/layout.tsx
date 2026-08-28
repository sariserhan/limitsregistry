import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { AdminTabs } from "./AdminTabs";
import "./admin.css";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole("ADMIN");

  return <main className="admin-shell">
    <PublicHeader />
    <div className="admin-content">
      <h1>Admin</h1>
      <p>Signed in as {session.user.email} · {session.user.role}.</p>
      <AdminTabs />
      <div className="admin-tab-content">{children}</div>
    </div>
    <SiteFooter />
  </main>;
}
