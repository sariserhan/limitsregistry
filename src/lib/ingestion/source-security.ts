import { isIP } from "node:net";

export const DEFAULT_PDF_HOSTS = ["arxiv.org", "export.arxiv.org"] as const;
const PRIVATE_IPV4 = /^(?:0\.|10\.|100\.(?:6[4-9]|[789]\d|1[01]\d|12[0-7])\.|127\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.(?:0\.0|0\.2|168)\.|198\.(?:1[89]|51\.100)\.|203\.0\.113\.|224\.|240\.)/;

export function configuredPdfHosts(env = process.env.PDF_PUBLISHER_ALLOWLIST) {
  return new Set([...DEFAULT_PDF_HOSTS, ...(env ?? "").split(",")].map((host) => host.trim().toLowerCase()).filter(Boolean));
}

export function validatePdfSourceUrl(raw: string, hosts = configuredPdfHosts()) {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("PDF source must be a valid URL."); }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("PDF source must use credential-free HTTPS on the default port.");
  if (!hosts.has(hostname)) throw new Error(`PDF host ${hostname} is not allowlisted.`);
  if (hostname === "localhost" || isPrivateIp(hostname)) throw new Error("Private and local PDF hosts are forbidden.");
  url.hash = "";
  return url;
}

export function isPrivateIp(value: string) {
  const version = isIP(value);
  if (version === 4) return PRIVATE_IPV4.test(value);
  if (version === 6) { const normalized = value.toLowerCase(); const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); if (mapped) return isPrivateIp(mapped[1]); return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("ff"); }
  return false;
}
