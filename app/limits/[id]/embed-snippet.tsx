"use client";

import { useState } from "react";

export function EmbedSnippet({ registryNumber }: { registryNumber: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = "[![Limits Registry " + registryNumber + "](https://limitsregistry.com/api/badge/" + registryNumber + ".svg)](https://limitsregistry.com/limits/" + registryNumber + ")";
  async function copy() { await navigator.clipboard.writeText(snippet); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <div className="embed-snippet"><span className="aside-label">Embed this Limit</span><p>Put a live, cited frontier badge in a paper, README, or lab page.</p><code>{snippet}</code><button type="button" onClick={copy}>{copied ? "Copied" : "Copy Markdown"}</button></div>;
}
