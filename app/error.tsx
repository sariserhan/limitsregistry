"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "../src/components/public-header";
import { SiteFooter } from "../src/components/site-footer";
import "./status.css";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return <main className="status-page">
    <PublicHeader />
    <div className="status-content">
      <span className="status-code">Error</span>
      <h1>Something went wrong</h1>
      <p>An unexpected error interrupted this page. You can try again, or head back to the Registry.</p>
      {error.digest && <code>Reference: {error.digest}</code>}
      <div className="status-actions">
        <button onClick={() => retry()}>Try again</button>
        <Link className="secondary" href="/">Back to Registry</Link>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
