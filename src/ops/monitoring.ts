export function reportError(error: unknown, context: { requestId: string; route: string }) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ level: "error", message, ...context, timestamp: new Date().toISOString() }));
}
