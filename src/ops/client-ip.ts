// Match the existing export endpoint: only trust the nearest proxy's appended hop.
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
}
