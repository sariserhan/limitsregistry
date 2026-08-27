"use client";

import { useState } from "react";

const WIDTHS = { mobile: 375, desktop: 640 } as const;

function EmailPreview({ html }: { html: string }) {
  const [width, setWidth] = useState<keyof typeof WIDTHS>("desktop");
  return <>
    <div style={{ display: "flex", gap: 8, margin: "14px 0 10px" }}>
      {(Object.keys(WIDTHS) as (keyof typeof WIDTHS)[]).map((key) => (
        <button key={key} type="button" onClick={() => setWidth(key)} className="secondary-button" style={{ opacity: width === key ? 1 : 0.5 }}>{key}</button>
      ))}
    </div>
    <iframe title="Email preview" srcDoc={html} className="admin-gallery-frame" style={{ width: WIDTHS[width], height: 640, maxWidth: "100%" }} />
  </>;
}

export function EmailGallery({ samples }: { samples: { name: string; html: string }[] }) {
  return <div>
    {samples.map((sample) => <details key={sample.name} className="admin-panel admin-gallery-item">
      <summary>{sample.name}</summary>
      <EmailPreview html={sample.html} />
    </details>)}
  </div>;
}
