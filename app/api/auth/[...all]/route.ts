import { getAuth } from "../../../../src/auth/auth";

// Not toNextJsHandler(getAuth()) — that would call getAuth() (and so
// betterAuth(), which touches the db) at import time. These thin wrappers
// defer it to request time; see the comment on getAuth() for why that matters.
function handler(request: Request) {
  return getAuth().handler(request);
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
