import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { user_repository } from "@/features/authentication_and_authorization/auth/repositories/user.repository";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { z } from "zod";

const list_users_dto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const assign_role_dto = z.object({
  user_id: z.string().min(1),
  role_name: z.string().min(1),
});

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const input = list_users_dto.parse({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
  });
  return user_repository.list_paginated(input.page, input.limit);
}, PERMISSIONS.users_read);

export const POST = admin_route(async ({ req, user }) => {
  const body = await req.json();
  const input = assign_role_dto.parse(body);
  await role_repository.assign_role(input.user_id, input.role_name);
  await audit_service.log({
    actor_user_id: user.id,
    action: "role.assigned",
    resource_type: "user",
    resource_id: input.user_id,
    metadata: { role_name: input.role_name },
  });
  return { ok: true };
}, PERMISSIONS.roles_manage);
