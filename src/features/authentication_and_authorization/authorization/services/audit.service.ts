import "server-only";

import { logger } from "@/lib/logger";

import { AuditRepository } from "../repositories/audit.repository";

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
    try {
      await this.repo.insert({
        actor_user_id: input.actor_user_id ?? null,
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
