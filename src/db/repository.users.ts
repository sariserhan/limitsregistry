import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "./client";
import { auditLogs, user } from "./schema";
import type { Role } from "../auth/permissions";

export async function listUsers() {
  return db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).orderBy(asc(user.createdAt));
}

export async function setUserRole(userId: string, role: Role, actorUserId: string, previousRole: Role) {
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));
  await db.insert(auditLogs).values({ actorUserId, action: "SET_ROLE", entityType: "user", entityId: userId, before: { role: previousRole }, after: { role } });
}
