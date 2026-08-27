"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../../src/auth/session";
import { ROLES, hasRole, type Role } from "../../src/auth/permissions";
import { listUsers, setUserRole } from "../../src/db/repository.users";

export async function updateUserRole(formData: FormData) {
  const session = await requireRole("ADMIN");
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));
  if (!ROLES.includes(role as Role)) throw new Error("Invalid role.");
  const target = (await listUsers()).find((u) => u.id === userId);
  if (!target) throw new Error("User not found.");
  // Only a SUPERADMIN may grant admin-tier access — or change the role of a user who already has it.
  // Checking only the requested role would let a plain ADMIN silently demote an existing SUPERADMIN.
  const touchesAdminTier = hasRole(role as Role, "ADMIN") || hasRole(target.role as Role, "ADMIN");
  if (touchesAdminTier && session.user.role !== "SUPERADMIN") throw new Error("Only a superadmin can modify admin-level accounts.");
  await setUserRole(userId, role as Role, session.user.id, target.role as Role);
  revalidatePath("/admin");
}
