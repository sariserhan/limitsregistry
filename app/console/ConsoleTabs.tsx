"use client";

import { useState, type ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

export function ConsoleTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return <>
    <nav className="console-tabs">
      {tabs.map((tab) => <button key={tab.id} type="button" className={tab.id === active ? "active" : undefined} onClick={() => setActive(tab.id)}>{tab.label}</button>)}
    </nav>
    {/* Every tab's content stays mounted (just hidden) — it's already fetched server-side in
       one request, so hiding/showing is instant with no refetch or loading flicker. */}
    {tabs.map((tab) => <div key={tab.id} hidden={tab.id !== active} className="console-tab-panel">{tab.content}</div>)}
  </>;
}
