const windows = new Map<string, { started: number; count: number }>();
export function allowRequest(key: string, limit = 60, windowMs = 60_000) { const now = Date.now(); const current = windows.get(key); if (!current || now - current.started >= windowMs) { windows.set(key, { started: now, count: 1 }); return true; } if (current.count >= limit) return false; current.count += 1; return true; }
