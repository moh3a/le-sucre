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
  async list_roles_with_permissions() {
    const all_roles = await db.select().from(roles);
    const links = await db
      .select({
        role_name: roles.name,
        permission_name: permissions.name,
      })
      .from(role_permissions)
      .innerJoin(roles, eq(role_permissions.role_id, roles.id))
      .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id));

    return all_roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: links.filter((l) => l.role_name === role.name).map((l) => l.permission_name),
    }));
  }

  async replace_role_permissions(role_name: string, permission_names: string[]) {
    const [role] = await db.select().from(roles).where(eq(roles.name, role_name)).limit(1);
    if (!role) throw new Error(`Role ${role_name} not found`);

    await db.delete(role_permissions).where(eq(role_permissions.role_id, role.id));

    const all_permissions = await db.select().from(permissions);
    for (const permission_name of permission_names) {
      const perm = all_permissions.find((p) => p.name === permission_name);
      if (!perm) continue;
      await db.insert(role_permissions).values({
        role_id: role.id,
        permission_id: perm.id,
      });
    }
  }

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
    await db.delete(user_roles).where(eq(user_roles.user_id, user_id));
    await db.insert(user_roles).values({ user_id, role_id: role.id });
  }

  async user_has_role(user_id: string, role_names: string[]) {
    const rows = await this.find_roles_by_user_id(user_id);
    return rows.some((r) => role_names.includes(r.name));
  }

  async user_has_permission(user_id: string, permission: string) {
    const rows = await this.find_permissions_by_user_id(user_id);
    return rows.some((p) => p.name === permission);
  }

  async stats(): Promise<{
    total_roles: number;
    total_permissions: number;
    avg_permissions_per_role: number;
  }> {
    const all_roles = await db.select().from(roles);
    const all_permissions = await db.select().from(permissions);
    const links = await db
      .select({
        role_name: roles.name,
        permission_name: permissions.name,
      })
      .from(role_permissions)
      .innerJoin(roles, eq(role_permissions.role_id, roles.id))
      .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id));

    const permissions_per_role = all_roles.map(
      (role) => links.filter((l) => l.role_name === role.name).length,
    );
    const avg_permissions =
      permissions_per_role.length > 0
        ? Math.round(permissions_per_role.reduce((a, b) => a + b, 0) / permissions_per_role.length)
        : 0;

    return {
      total_roles: all_roles.length,
      total_permissions: all_permissions.length,
      avg_permissions_per_role: avg_permissions,
    };
  }
}

export const role_repository = new RoleRepository();
