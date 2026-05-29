import "server-only";

import { logger } from "@/lib/logger";

import { AuditRepository } from "../repositories/audit.repository";
import { auth_service } from "../../auth/service";

export class AuditService {
  constructor(private readonly repo = new AuditRepository()) {}

  async log(input: {
    actor_user_id?: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
  }) {
    let default_user_id = input.actor_user_id;
    if (!default_user_id) {
      const session = await auth_service.get_session();
      default_user_id = session.user.id;
    }
    try {
      await this.repo.insert({
        actor_user_id: default_user_id,
        action: input.action,
        resource_type: input.resource_type ?? null,
        resource_id: input.resource_id ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ip_address: input.ip_address ?? null,
        user_agent: input.user_agent ?? null,
      });
    } catch (error) {
      logger.error("audit_log_failed", {
        action: input.action,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }
}

export const audit_service = new AuditService();
