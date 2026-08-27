import { randomUUID } from "node:crypto";
export function withRequestId(response: Response, requestId = randomUUID()) { response.headers.set("x-request-id", requestId); return response; }
