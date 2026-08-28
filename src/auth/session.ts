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

/** Secure server-side check. Unauthenticated users sign in; under-privileged users get an access explanation. */
export async function requireRole(minimum: Role) {
  const session = await getSession();
  if (!session) {
    const requestHeaders = await headers();
    const next = requestHeaders.get("x-pathname") || "/";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  if (!hasRole(session.user.role as Role, minimum)) {
    const requestHeaders = await headers();
    const next = requestHeaders.get("x-pathname") || "/";
    redirect(`/access-required?next=${encodeURIComponent(next)}&required=${minimum}`);
  }
  return session;
}
