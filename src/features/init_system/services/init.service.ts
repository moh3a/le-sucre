import "server-only";

import { migrate } from "drizzle-orm/mysql2/migrator";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import {
  users,
  roles,
  user_roles,
  permissions as permissions_table,
  role_permissions,
} from "@/features/authentication_and_authorization/auth/schema";
import { ROLE_NAMES } from "@/features/authentication_and_authorization/authorization/constants/roles";
import {
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
} from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { generate_id } from "@/lib/utils";
import { INIT_ERROR } from "../constants/error-codes";
import { init_repository } from "../repositories/init.repository";

export interface InitStatus {
  initialized: boolean;
  db_connected: boolean;
  tables_exist: boolean;
  has_admin: boolean;
  has_roles: boolean;
}

export class InitService {
  async check_status(): Promise<InitStatus> {
    const db_ok = await this.test_db_connection();
    const statusObject = {
      initialized: false,
      db_connected: false,
      tables_exist: false,
      has_admin: false,
      has_roles: false,
    };

    if (!db_ok) {
      return statusObject;
    }

    const tables_exist = await this.check_tables_exist();
    statusObject.db_connected = tables_exist;

    if (!tables_exist) {
      return statusObject;
    }

    const status = await init_repository.get_status();
    const initialized = status?.initialized ?? false;
    statusObject.initialized = initialized;

    if (initialized) {
      return statusObject;
    }

    const [admin_user] = await db.select({ id: users.id }).from(users).limit(1);
    const has_admin = !!admin_user;
    statusObject.has_admin = has_admin;

    const role_count = await db.$count(roles);
    const has_roles = role_count > 0;
    statusObject.has_roles = has_roles;

    // Auto-heal: if everything is already in place but system_status is missing,
    // create and mark it completed so subsequent checks see initialized: true.
    if (has_admin && has_roles && !initialized) {
      const admin = await this.find_first_admin();
      await init_repository.upsert(admin?.id);
      if (admin?.id) {
        await init_repository.mark_completed(admin.id);
      }
      return {
        initialized: true,
        db_connected: true,
        tables_exist: true,
        has_admin: true,
        has_roles: true,
      };
    }

    return statusObject;
  }

  async ensure_status_entry(admin_user_id?: string) {
    let resolved_id = admin_user_id;

    if (!resolved_id) {
      const admin = await this.find_first_admin();
      resolved_id = admin?.id;
    }

    await init_repository.upsert(resolved_id);

    if (resolved_id) {
      const already = await init_repository.is_initialized();
      if (!already) {
        await init_repository.mark_completed(resolved_id);
      }
    }
  }

  async find_first_admin() {
    const [admin_role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, ROLE_NAMES.admin))
      .limit(1);
    if (!admin_role) return null;

    const [admin_user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .innerJoin(user_roles, eq(user_roles.user_id, users.id))
      .where(eq(user_roles.role_id, admin_role.id))
      .limit(1);
    return admin_user ?? null;
  }

  async run_migrations() {
    const already = await init_repository.is_initialized();
    if (already) throw_error(INIT_ERROR.ALREADY_COMPLETED);

    try {
      await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
    } catch {
      throw_error(INIT_ERROR.MIGRATION_FAILED);
    }
  }

  async seed_roles_and_permissions() {
    const already = await init_repository.is_initialized();
    if (already) throw_error(INIT_ERROR.ALREADY_COMPLETED);

    try {
      const existing_roles = await db.select({ name: roles.name }).from(roles);
      const existing_role_names = new Set(existing_roles.map((r) => r.name));

      const all_permission_names = Object.values(PERMISSIONS);
      const existing_permissions = await db
        .select({ name: permissions_table.name })
        .from(permissions_table);
      const existing_perm_names = new Set(existing_permissions.map((p) => p.name));

      const new_permissions = all_permission_names
        .filter((p) => !existing_perm_names.has(p))
        .map((name) => ({
          id: generate_id(),
          name,
          description: null,
        }));

      if (new_permissions.length > 0) {
        await db.insert(permissions_table).values(new_permissions);
      }

      const all_perms = await db.select().from(permissions_table);
      const perm_map = new Map(all_perms.map((p) => [p.name, p.id]));

      for (const [role_name, perms] of Object.entries(ROLE_PERMISSION_MAP)) {
        let role_id: string;

        if (existing_role_names.has(role_name)) {
          const [existing] = await db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.name, role_name))
            .limit(1);
          role_id = existing!.id;
        } else {
          role_id = generate_id();
          await db.insert(roles).values({
            id: role_id,
            name: role_name,
            description: `Role: ${role_name}`,
          });
        }

        const existing_links = await db
          .select({ permission_id: role_permissions.permission_id })
          .from(role_permissions)
          .where(eq(role_permissions.role_id, role_id));
        const existing_perm_ids = new Set(existing_links.map((l) => l.permission_id));

        const missing = perms
          .map((p) => perm_map.get(p))
          .filter((id): id is string => id !== undefined && !existing_perm_ids.has(id));

        if (missing.length > 0) {
          await db
            .insert(role_permissions)
            .values(missing.map((permission_id) => ({ role_id, permission_id })));
        }
      }
    } catch {
      throw_error(INIT_ERROR.SEED_FAILED);
    }
  }

  async create_admin(input: { name: string; email: string; password: string }) {
    const already = await init_repository.is_initialized();
    if (already) throw_error(INIT_ERROR.ALREADY_COMPLETED);

    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
          rememberMe: false,
        },
      });

      const user_id = result.user.id;

      await role_repository.assign_role(user_id, ROLE_NAMES.admin);

      return { user_id };
    } catch {
      throw_error(INIT_ERROR.ADMIN_CREATION_FAILED);
    }
  }

  async complete(admin_user_id: string) {
    const already = await init_repository.is_initialized();
    if (already) throw_error(INIT_ERROR.ALREADY_COMPLETED);

    try {
      await init_repository.mark_completed(admin_user_id);
    } catch {
      throw_error(INIT_ERROR.COMPLETION_FAILED);
    }
  }

  private async check_tables_exist(): Promise<boolean> {
    try {
      const data = await db._.tableNamesMap;
      return !!Object.keys(data).length;
    } catch {
      return false;
    }
  }

  private async test_db_connection() {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}

export const init_service = new InitService();
