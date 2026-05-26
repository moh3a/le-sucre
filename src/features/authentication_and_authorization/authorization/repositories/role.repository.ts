import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  roles,
  permissions,
  user_roles,
  role_permissions,
} from "@/features/authentication_and_authorization/auth/schema";

export class RoleRepository {
  async find_roles_by_user_id(user_id: string) {
    return db
      .select({ id: roles.id, name: roles.name })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.user_id, user_id));
  }

  async find_permissions_by_user_id(user_id: string) {
    return db
      .selectDistinct({ name: permissions.name })
      .from(user_roles)
      .innerJoin(role_permissions, eq(user_roles.role_id, role_permissions.role_id))
      .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
      .where(eq(user_roles.user_id, user_id));
  }

  async assign_role(user_id: string, role_name: string) {
    const [role] = await db.select().from(roles).where(eq(roles.name, role_name)).limit(1);
    if (!role) throw new Error(`Role ${role_name} not found`);
    await db
      .insert(user_roles)
      .values({ user_id, role_id: role.id })
      .onDuplicateKeyUpdate({ set: {} });
  }

  async user_has_role(user_id: string, role_names: string[]) {
    const rows = await this.find_roles_by_user_id(user_id);
    return rows.some((r) => role_names.includes(r.name));
  }

  async user_has_permission(user_id: string, permission: string) {
    const rows = await this.find_permissions_by_user_id(user_id);
    return rows.some((p) => p.name === permission);
  }
}

export const role_repository = new RoleRepository();