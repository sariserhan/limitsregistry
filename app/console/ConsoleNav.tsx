"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/console", label: "Console" },
  { href: "/console/research", label: "Infrastructure" },
  { href: "/console/research/graph", label: "Graph" },
  { href: "/console/research/artifacts", label: "Artifacts" },
  { href: "/console/research/bounties", label: "Bounties" },
  { href: "/console/create-record", label: "New record" },
];

export function ConsoleNav() {
  const pathname = usePathname();
  return <nav className="console-nav">
    {TABS.map((tab) => <Link key={tab.href} href={tab.href} className={pathname === tab.href ? "active" : undefined}>{tab.label}</Link>)}
  </nav>;
}
