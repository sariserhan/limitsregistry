import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { ConsoleNav } from "./ConsoleNav";
import "./console.css";

// Baseline gate for the whole Research Console subtree. Pages with a stricter minimum (CODATA
// review requires REVIEWER, one rank above the RESEARCHER floor everyone else uses) still call
// requireRole() themselves on top of this — redundant for most visitors, but this layout alone
// can't express a per-route minimum.
export default async function ConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole("RESEARCHER");

  return <main className="console-page">
    <PublicHeader />
    <div className="console-content">
      <header className="console-header">
        <span className="console-session">Signed in as {session.user.email} · {session.user.role}</span>
        <Link className="console-exit" href="/">Public Registry ↗</Link>
      </header>
      <ConsoleNav />
      {children}
    </div>
    <SiteFooter />
  </main>;
}
