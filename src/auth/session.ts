import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import { hasRole, type Role } from "./permissions";

export async function getSession() {
  // headers() must resolve before getAuth() runs: it's what tells Next.js
  // this route is dynamic and to skip static prerendering. getAuth() touches
  // the db (unavailable at build time — see the comment on it) and would
  // otherwise throw first, before Next.js ever sees the dynamic-API signal.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

/** Secure server-side check. Redirects to /login when unauthenticated or under-privileged. */
export async function requireRole(minimum: Role) {
  const session = await getSession();
  if (!session || !hasRole(session.user.role as Role, minimum)) {
    redirect(`/login?next=${encodeURIComponent(`/`)}`);
  }
  return session;
}
