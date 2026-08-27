const LEVEL_LABEL: Record<string, string> = { INFO: "Notice", WARNING: "Warning", CRITICAL: "Critical" };

export function AnnouncementBanner({ message, level }: { message: string | null; level: "INFO" | "WARNING" | "CRITICAL" }) {
  if (!message) return null;
  return <div className={`announcement-banner announcement-${level.toLowerCase()}`} role="status">
    <span className="announcement-label">{LEVEL_LABEL[level]}</span>
    <span>{message}</span>
  </div>;
}
