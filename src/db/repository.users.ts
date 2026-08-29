import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, session, account, user } from "./schema";
import type { Role } from "../auth/permissions";

export async function listUsers() {
  return db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).orderBy(asc(user.createdAt));
}

export async function setUserRole(userId: string, role: Role, actorUserId: string, previousRole: Role) {
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));
  await db.insert(auditLogs).values({ actorUserId, action: "SET_ROLE", entityType: "user", entityId: userId, before: { role: previousRole }, after: { role } });
}

// Deliberately not a hard SQL DELETE: most tables that reference a user (submissions, reviews,
// audit logs, claim attribution...) do so as evidence of real Registry activity, and several of
// those foreign keys are NOT NULL with no ON DELETE clause — a real DELETE FROM "user" would
// either fail outright on any contributing account or (if forced) destroy attribution history
// this Registry exists to preserve. Anonymize instead: strip the real identity, revoke elevated
// access, and kill every session/credential so the account can no longer sign in — everything the
// account is credited for stays exactly where it is.
export async function deleteUser(userId: string, actorUserId: string) {
  const [target] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (!target) throw new Error("User not found.");
  if (target.role === "SUPERADMIN" && (await countSuperadmins()) <= 1) throw new Error("Cannot delete the only remaining superadmin.");
  const placeholderEmail = `deleted-${randomUUID()}@deleted.limitsregistry.internal`;
  await db.transaction(async (tx) => {
    await tx.update(user).set({ name: "Deleted user", email: placeholderEmail, image: null, role: "USER", updatedAt: new Date() }).where(eq(user.id, userId));
    await tx.delete(session).where(eq(session.userId, userId));
    await tx.delete(account).where(eq(account.userId, userId));
    await tx.insert(auditLogs).values({ actorUserId, action: "DELETE_USER", entityType: "user", entityId: userId, before: { name: target.name, email: target.email, role: target.role }, after: { anonymized: true } });
  });
}

export async function countSuperadmins(excludingUserId?: string) {
  const rows = await db.select({ id: user.id }).from(user).where(excludingUserId ? and(eq(user.role, "SUPERADMIN"), ne(user.id, excludingUserId)) : eq(user.role, "SUPERADMIN"));
  return rows.length;
}
