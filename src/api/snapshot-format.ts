export const SNAPSHOT_SCHEMA_VERSION = 1;
export const PILOT_PER_MINUTE = 30;
export type SnapshotFormat = "json" | "ndjson";

export function snapshotFormat(url: string): SnapshotFormat | null {
  const value = new URL(url).searchParams.get("format") ?? "ndjson";
  return value === "json" || value === "ndjson" ? value : null;
}

export function matchesEtag(header: string | null, etag: string) {
  return header?.split(",").some((value) => {
    const tag = value.trim();
    return tag === "*" || tag.replace(/^W\//, "") === etag;
  }) ?? false;
}

export function snapshotJson(value: unknown) {
  return JSON.stringify(value, (_key, item) => typeof item === "bigint" ? item.toString() : item);
}
