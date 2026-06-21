import { admin_route } from "@/lib/api/admin-handler";
import { ip_blacklist_service } from "@/features/ip_blacklist/services/blacklist.service";
import { add_to_blacklist_schema, list_blacklist_schema } from "@/features/ip_blacklist/validators/blacklist.validator";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const params = list_blacklist_schema.parse(Object.fromEntries(url.searchParams));
  return ip_blacklist_service.list(params);
}, "blacklist:view");

export const POST = admin_route(async ({ req, user }) => {
  const body = await req.json();
  const data = add_to_blacklist_schema.parse(body);
  return ip_blacklist_service.add({ ...data, created_by: user.id });
}, "blacklist:create");
