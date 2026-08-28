"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/account", label: "Overview" },
  { href: "/account/apply", label: "Editorial access" },
];

export function AccountTabs() {
  const pathname = usePathname();
  return <nav className="admin-tabs" aria-label="Account sections">
    {TABS.map((tab) => <Link href={tab.href} key={tab.href} className={pathname === tab.href ? "active" : undefined}>{tab.label}</Link>)}
  </nav>;
}
