import { admin_route } from "@/lib/api/admin-handler";

export const GET = admin_route(async ({ user, rbac }) => ({ user, rbac }));
