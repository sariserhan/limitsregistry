"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Users" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/prize-pools", label: "Prize pools" },
  { href: "/admin/settings", label: "Site controls" },
  { href: "/admin/send-email", label: "Send email" },
  { href: "/admin/quality", label: "Data quality" },
  { href: "/admin/acquisition", label: "Acquisition" },
  { href: "/admin/duplicates", label: "Duplicates" },
  { href: "/admin/health", label: "Health" },
  { href: "/admin/usage", label: "Usage" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/contact", label: "Contact" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return <nav className="admin-tabs">
    {TABS.map((tab) => <Link key={tab.href} href={tab.href} className={pathname === tab.href ? "active" : undefined}>{tab.label}</Link>)}
  </nav>;
}
