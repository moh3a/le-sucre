import { admin_route } from "@/lib/api/admin-handler";
import { ip_blacklist_service } from "@/features/ip_blacklist/services/blacklist.service";
import { update_blacklist_schema } from "@/features/ip_blacklist/validators/blacklist.validator";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop()!;
  return ip_blacklist_service.get_by_id(id);
}, "blacklist:view");

export const PATCH = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop()!;
  const body = await req.json();
  const data = update_blacklist_schema.parse(body);
  return ip_blacklist_service.update(id, data);
}, "blacklist:update");

export const DELETE = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop()!;
  await ip_blacklist_service.remove(id);
  return { success: true };
}, "blacklist:delete");
