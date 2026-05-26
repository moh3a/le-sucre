import "server-only";

import { db } from "@/lib/db";
import { audit_logs } from "@/features/authentication_and_authorization/auth/schema";

export type AuditLogInsert = {
  actor_user_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
};

export class AuditRepository {
  async insert(input: AuditLogInsert) {
    const [row] = await db.insert(audit_logs).values(input).$returningId();
    return row;
  }
}

export const audit_repository = new AuditRepository();
