import { desc, eq, sql } from "drizzle-orm";
import { requireRole } from "../../../src/auth/session";
import { db } from "../../../src/db/client";
import { apiKeys, apiUsageDaily } from "../../../src/db/schema";
import { currentSnapshot, snapshotStorageConfigured } from "../../../src/api/snapshots";
import { hasDistributedRateLimit } from "../../../src/ops/rate-limit";
import { API_V1_PAUSED } from "../../../src/api/v1-paused";
import { IssueKeyForm, PublishSnapshotButton, RevokeKeyButton } from "./KeyControls";

export const runtime = "nodejs";
export const maxDuration = 300;

export default async function ApiKeysPage() {
  await requireRole("ADMIN");
  const [keys, snapshot] = await Promise.all([
    db.select({ id: apiKeys.id, prefix: apiKeys.keyPrefix, organization: apiKeys.organizationName,
      email: apiKeys.contactEmail, status: apiKeys.status, note: apiKeys.note,
      downloads: sql<number>`coalesce(sum(${apiUsageDaily.downloads}) filter (where ${apiUsageDaily.day} >= date_trunc('month', now() at time zone 'UTC')::date), 0)::int`,
      lastUsedAt: sql<Date | string | null>`max(${apiUsageDaily.lastDownloadedAt})`,
    }).from(apiKeys).leftJoin(apiUsageDaily, eq(apiUsageDaily.keyId, apiKeys.id)).groupBy(apiKeys.id).orderBy(desc(apiKeys.createdAt)),
    currentSnapshot(),
  ]);
  const configured = snapshotStorageConfigured();
  return <>
    <section className="admin-section">
      <h2>Commercial API pilot</h2>
      <p>One manually invoiced tier. Keys unlock snapshots; public record access requires no key. Revoke a key when its pilot ends.</p>
      {API_V1_PAUSED && <p role="status">The API kill switch is on. Downloads and public v1 endpoints are paused.</p>}
      {!hasDistributedRateLimit() && <p role="status">Distributed rate limiting is not configured. Production snapshot downloads will return 503 until Upstash is connected.</p>}
      <IssueKeyForm />
    </section>
    <section className="admin-section">
      <h2>Published snapshot</h2>
      {snapshot ? <p>{snapshot.recordCount} records · Schema {snapshot.schemaVersion} · Generated {snapshot.generatedAt.toISOString()} · Revision {snapshot.ndjsonHash.slice(0, 12)}</p> : <p>No snapshot published yet.</p>}
      <p>Publish after an editorial release. Customers receive this version until you publish another. Generation reads a consistent database view and uploads private JSON and NDJSON files before switching the current version.</p>
      {!configured && <p>Connect a private Vercel Blob store to enable publication.</p>}
      <PublishSnapshotButton configured={configured} />
    </section>
    <section className="admin-section">
      <h2>Issued keys</h2>
      <p>Downloads started this calendar month (UTC). Conditional 304 responses and rejected requests are excluded. An interrupted transfer may still count.</p>
      {!keys.length ? <p>No keys issued yet.</p> : <div className="admin-table-scroll"><table className="admin-table">
        <thead><tr><th>Key</th><th>Organisation</th><th>Status</th><th>Downloads</th><th>Last download (UTC)</th><th>Actions</th></tr></thead>
        <tbody>{keys.map((key) => <tr key={key.id}>
          <td><code>{key.prefix}…</code></td><td>{key.organization}<br /><small>{key.email}</small>{key.note && <details><summary>Deal note</summary><p>{key.note}</p></details>}</td>
          <td>{key.status}</td><td>{key.downloads}</td><td>{key.lastUsedAt ? new Date(key.lastUsedAt).toISOString() : "Never"}</td>
          <td>{key.status === "ACTIVE" ? <RevokeKeyButton id={key.id} prefix={key.prefix} /> : "Revoked"}</td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </>;
}
