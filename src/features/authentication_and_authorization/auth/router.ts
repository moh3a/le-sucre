import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import {
  permission_procedure,
  protected_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { authorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { audit_repository } from "@/features/authentication_and_authorization/authorization/repositories/audit.repository";
import {
  assign_role_dto,
  create_user_dto,
} from "@/features/authentication_and_authorization/auth/models/auth.dto";
import { login_dto, register_dto } from "@/features/authentication_and_authorization/auth/models/auth.dto";
import z from "zod";
import { auth } from "@/lib/auth";
import { user_repository } from "./repositories/user.repository";
import { profile_repository } from "@/features/authentication_and_authorization/profile/repositories/profile.repository";
import { phone_auth_service } from "./services/phone-auth.service";

export const auth_router = create_trpc_router({
  // ─── Phone-based authentication ──────────────────────────────
  signUp: public_procedure
    .input(register_dto)
    .mutation(async ({ ctx, input }) => {
      const result = await phone_auth_service.sign_up({
        name: input.name,
        phone: input.phone,
        password: input.password,
      });
      await audit_service.log({
        actor_user_id: result.user.id,
        action: "auth.register",
        resource_type: "user",
        resource_id: result.user.id,
        metadata: { phone: input.phone },
      });
      return result;
    }),

  signIn: public_procedure
    .input(login_dto)
    .mutation(async ({ ctx, input }) => {
      const result = await phone_auth_service.sign_in({
        phone: input.phone,
        password: input.password,
        remember_me: input.remember_me,
      });
      await audit_service.log({
        actor_user_id: result.user.id,
        action: "auth.login",
        resource_type: "user",
        resource_id: result.user.id,
        metadata: { phone: input.phone },
      });
      return result;
    }),

  resolvePhone: public_procedure
    .input(z.object({ phone: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return phone_auth_service.find_by_phone(input.phone);
    }),

  me: protected_procedure.query(async ({ ctx }) => {
    const rbac = await authorizationService.get_auth_context(ctx.user.id);
    const profile = await profile_repository.find_by_user_id(ctx.user.id);
    return { user: ctx.user, ...rbac, profile };
  }),

  updateProfile: protected_procedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        image: z.string().max(2048).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const patch: Parameters<typeof user_repository.update_profile>[1] = {
        name: input.name,
      };
      if (input.image !== undefined) {
        patch.image = input.image;
      }
      await user_repository.update_profile(ctx.user.id, patch);
      await audit_service.log({
        actor_user_id: ctx.user.id,
        action: "profile.updated",
        resource_type: "user",
        resource_id: ctx.user.id,
        metadata: { name: input.name },
      });
      return { ok: true };
    }),

  changePassword: protected_procedure
    .input(
      z.object({
        current_password: z.string().min(1),
        new_password: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.changePassword({
        body: {
          newPassword: input.new_password,
          currentPassword: input.current_password,
          revokeOtherSessions: true,
        },
      });
      await audit_service.log({
        actor_user_id: ctx.user.id,
        action: "password.changed",
        resource_type: "user",
        resource_id: ctx.user.id,
      });
      return { ok: true };
    }),

  myActivity: protected_procedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return audit_repository.list_by_user(ctx.user.id, input.page, input.limit);
    }),
});

export const admin_auth_router = create_trpc_router({
  assignRole: permission_procedure(PERMISSIONS.roles_manage)
    .input(assign_role_dto)
    .mutation(async ({ ctx, input }) => {
      await role_repository.assign_role(input.user_id, input.role_name);
      await audit_service.log({
        actor_user_id: ctx.user.id,
        action: "role.assigned",
        resource_type: "user",
        resource_id: input.user_id,
        metadata: input,
      });
      return { ok: true };
    }),
  updateUser: permission_procedure(PERMISSIONS.users_write)
    .input(
      z.object({
        user_id: z.string().min(1),
        name: z.string().min(2).max(255).optional(),
        phone: z.string().optional(),
        is_active: z.boolean().optional(),
        password: z.string().min(8).max(128).optional(),
        banned: z.boolean().optional(),
        ban_reason: z.string().max(500).optional(),
        ban_expires: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user_id, password, banned, ban_reason, ban_expires, phone, ...profile_patch } = input;

      const update_data: Parameters<typeof user_repository.update_profile>[1] = {
        name: profile_patch.name,
        is_active: profile_patch.is_active,
      };

      if (phone) {
        update_data.phone = phone;
      }

      if (banned !== undefined) {
        update_data.banned = banned;
        if (banned) {
          update_data.ban_reason = ban_reason ?? null;
          update_data.ban_expires = ban_expires ? new Date(ban_expires) : null;
        } else {
          update_data.ban_reason = null;
          update_data.ban_expires = null;
        }
      }

      await user_repository.update_profile(user_id, update_data);

      if (password) {
        await auth.api.setUserPassword({
          body: { userId: user_id, newPassword: password },
        });
      }

      await audit_service.log({
        actor_user_id: ctx.user.id,
        action: "user.updated",
        resource_type: "user",
        resource_id: user_id,
        metadata: input,
      });
      return { ok: true };
    }),
  createUser: permission_procedure(PERMISSIONS.users_write)
    .input(create_user_dto)
    .mutation(async ({ ctx, input }) => {
      const result = await phone_auth_service.sign_up({
        name: input.name,
        phone: input.phone,
        password: input.password,
      });

      const user_id = result.user.id;

      // Override default customer role with the one specified by admin
      if (input.role !== "customer") {
        await role_repository.assign_role(user_id, input.role);
      }

      await audit_service.log({
        actor_user_id: ctx.user.id,
        action: "user.created",
        resource_type: "user",
        resource_id: user_id,
        metadata: { phone: input.phone, role: input.role },
      });

      return { user_id };
    }),
  listUsers: permission_procedure(PERMISSIONS.users_read)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => user_repository.list_paginated(input.page, input.limit)),
  getStats: permission_procedure(PERMISSIONS.users_read).query(() => user_repository.stats()),
  listAuditLogs: permission_procedure(PERMISSIONS.audit_read)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => audit_repository.list_paginated(input.page, input.limit)),
  listUsersByRole: permission_procedure(PERMISSIONS.users_read)
    .input(
      z.object({
        role: z.string().min(1).max(100),
      }),
    )
    .query(({ input }) => user_repository.find_users_by_role(input.role)),
});
