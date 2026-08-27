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
  // Only a SUPERADMIN may grant ADMIN or SUPERADMIN — an ADMIN cannot escalate themselves or others that high.
  if (hasRole(role as Role, "ADMIN") && session.user.role !== "SUPERADMIN") throw new Error("Only a superadmin can grant admin roles.");
  const target = (await listUsers()).find((u) => u.id === userId);
  if (!target) throw new Error("User not found.");
  await setUserRole(userId, role as Role, session.user.id, target.role as Role);
  revalidatePath("/admin");
}
