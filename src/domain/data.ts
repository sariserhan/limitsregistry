import { fixtures } from "./fixtures";
import type { Limit } from "./types";

export const browseLimits: Limit[] = fixtures.slice(0, 5).map(({ limit }) => limit);
export function getLimitById(id: string): Limit | undefined { return browseLimits.find((limit) => limit.id === id); }
export { fixtures };
