export const MAX_DELIVERY_ATTEMPTS = 5;
export function nextRetryAt(attempts: number, now = new Date()) { const minutes = Math.min(24 * 60, 2 ** Math.max(0, attempts - 1) * 5); return new Date(now.getTime() + minutes * 60_000); }
export function shouldRetry(attempts: number) { return attempts < MAX_DELIVERY_ATTEMPTS; }
