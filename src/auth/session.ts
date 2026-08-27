import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { hasRole, type Role } from "./permissions";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Secure server-side check. Redirects to /login when unauthenticated or under-privileged. */
export async function requireRole(minimum: Role) {
  const session = await getSession();
  if (!session || !hasRole(session.user.role as Role, minimum)) {
    redirect(`/login?next=${encodeURIComponent(`/`)}`);
  }
  return session;
}
