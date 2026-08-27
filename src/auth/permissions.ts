export const ROLES = ["USER", "RESEARCHER", "REVIEWER", "EDITOR", "ADMIN", "SUPERADMIN"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = { USER: 0, RESEARCHER: 1, REVIEWER: 2, EDITOR: 3, ADMIN: 4, SUPERADMIN: 5 };

export function hasRole(role: Role | null | undefined, minimum: Role) {
  if (!role) return false;
  return RANK[role] >= RANK[minimum];
}
