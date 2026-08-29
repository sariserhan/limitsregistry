"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/console", label: "Console", description: "Add papers and review Claims" },
  { href: "/console/applications", label: "Applications", description: "Review reviewer applicants" },
  { href: "/console/person-claims", label: "Attribution", description: "Review researcher claim requests" },
  { href: "/console/research", label: "Infrastructure", description: "Research relationships and tools" },
  { href: "/console/research/graph", label: "Graph", description: "Connect related Limits" },
  { href: "/console/research/artifacts", label: "Artifacts", description: "Verify Claims with evidence" },
  { href: "/console/research/bounties", label: "Bounties", description: "Review research incentives" },
  { href: "/console/create-record", label: "New record", description: "Create a draft Limit" },
];

export function ConsoleNav() {
  const pathname = usePathname();
  return <nav className="console-nav" aria-label="Research console sections">
    {TABS.map((tab) => <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined} className={pathname === tab.href ? "active" : undefined}><span className="console-nav-label">{tab.label}</span><small>{tab.description}</small></Link>)}
  </nav>;
}
