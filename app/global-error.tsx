"use client";

import "./globals.css";
import "./status.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="status-page">
          <div className="status-content">
            <span className="status-code">Error</span>
            <h1>The application crashed</h1>
            <p>Something went wrong at the top level. Try reloading the page.</p>
            {error.digest && <code>Reference: {error.digest}</code>}
            <div className="status-actions">
              <button onClick={() => retry()}>Try again</button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
