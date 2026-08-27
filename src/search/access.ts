import { hasRole, type Role } from "../auth/permissions";
export const canRefreshSearchIndex = (role: Role) => hasRole(role, "EDITOR");
