"use client";

import { useState, type ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

export function ConsoleTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return <>
    <nav className="console-tabs" aria-label="Research console workflow">
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={tab.id === active} aria-controls={`console-panel-${tab.id}`} className={tab.id === active ? "active" : undefined} onClick={() => setActive(tab.id)}>{tab.label}</button>)}
    </nav>
    {/* Every tab's content stays mounted (just hidden) — it's already fetched server-side in
       one request, so hiding/showing is instant with no refetch or loading flicker. */}
    {tabs.map((tab) => <div key={tab.id} id={`console-panel-${tab.id}`} role="tabpanel" hidden={tab.id !== active} className="console-tab-panel">{tab.content}</div>)}
  </>;
}
