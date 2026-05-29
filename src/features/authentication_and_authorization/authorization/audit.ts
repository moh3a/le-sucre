import { audit_service } from "./services/audit.service";

export async function audit_rbac(input: {
  actor_user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}) {
  return await audit_service.log(input);
}
