"use client";
import { useState } from "react";
export default function CopyCitationButton({ citation }: { citation: string }) { const [copied, setCopied] = useState(false); return <button type="button" onClick={async () => { await navigator.clipboard.writeText(citation); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{copied ? "Copied" : "Copy citation ↗"}</button>; }
