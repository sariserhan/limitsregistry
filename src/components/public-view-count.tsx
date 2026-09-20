"use client";
import { useEffect, useRef, useState } from "react";
import type { ViewKind } from "../domain/public-views";
import "./public-view-count.css";
type Count = { views: string; startedAt: string | null };
export function PublicViewCount({ kind, target }: { kind: ViewKind; target: string }) {
  // Keyed child resets state on a different target, including client-side navigation.
  return <ViewCounter key={`${kind}:${target}`} kind={kind} target={target}/>;
}
function ViewCounter({ kind, target }: { kind: ViewKind; target: string }) {
  const element = useRef<HTMLSpanElement>(null);
  const request = useRef<Promise<Count> | null>(null);
  const [count, setCount] = useState<Count | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () => {
      // React effect replay shares one receipt/request; a real refresh gets a new one.
      request.current ??= fetch("/api/views", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, target, receipt: crypto.randomUUID() }) }).then(async response => {
        if (!response.ok) throw new Error("Views unavailable");
        return await response.json() as Count;
      });
      void request.current.then(value => { if (active) setCount(value); }).catch(() => { if (active) setFailed(true); });
    };
    let observer: IntersectionObserver | undefined;
    if (kind === "BOUNTY" && element.current && "IntersectionObserver" in window) {
      const card = element.current.closest(".public-bounty, .canonical-bounty") || element.current;
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); load(); } }, { threshold: 0.1 });
      observer.observe(card);
    } else load();
    return () => { active = false; observer?.disconnect(); };
  }, [kind, target]);
  const label = `${kind === "BOUNTY" ? "bounty" : "page"} view${count?.views === "1" ? "" : "s"}`;
  const detail = `Browser views, including refreshes; not unique visitors.${count?.startedAt ? ` Counted since ${new Date(count.startedAt).toLocaleDateString()}.` : ""}${kind === "BOUNTY" ? " Counted when this bounty card becomes visible." : ""}`;
  return <span ref={element} className="public-view-count" title={detail} aria-live="polite">{failed ? "Views unavailable" : count ? `${BigInt(count.views).toLocaleString()} ${label}` : `— ${label}`}</span>;
}
