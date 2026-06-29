import "server-only";

import { security_event_service } from "@/features/authentication_and_authorization/auth/services/security-event.service";
import { logger } from "@/lib/logger";
import { extract_client_ip } from "@/lib/security/ip-blacklist";

export type AuthorizationResult = "granted" | "denied" | "forbidden";

export class AuthorizationAuditService {
  async log_access_attempt(params: {
    user_id: string | null;
    action: string;
    resource_type: string;
    resource_id?: string;
    result: AuthorizationResult;
    reason?: string;
    req?: Request;
  }): Promise<void> {
    const ip = params.req ? extract_client_ip(params.req) : undefined;

    if (params.result === "denied" || params.result === "forbidden") {
      await security_event_service.log("authorization_failure" as any, "warning", {
        user_id: params.user_id ?? undefined,
        ip_address: ip,
        metadata: {
          action: params.action,
          resource_type: params.resource_type,
          resource_id: params.resource_id,
          reason: params.reason,
          result: params.result,
        },
      });

      logger.warn("Authorization denied", {
        user_id: params.user_id,
        action: params.action,
        resource: `${params.resource_type}:${params.resource_id}`,
        reason: params.reason,
        ip,
      });
    }
  }

  async log_rate_limit_hit(params: {
    identifier: string;
    action: string;
    user_id?: string;
    req?: Request;
  }): Promise<void> {
    const ip = params.req ? extract_client_ip(params.req) : undefined;

    await security_event_service.log("rate_limit_hit", "warning", {
      user_id: params.user_id,
      ip_address: ip,
      metadata: {
        identifier: params.identifier,
        action: params.action,
      },
    });
  }

  async log_suspicious_request(params: {
    ip: string;
    path: string;
    method: string;
    reason: string;
    user_id?: string;
  }): Promise<void> {
    await security_event_service.log("login_suspicious" as any, "warning", {
      user_id: params.user_id,
      ip_address: params.ip,
      metadata: {
        path: params.path,
        method: params.method,
        reason: params.reason,
      },
    });

    logger.warn("Suspicious request detected", params);
  }
}

export const authorization_audit_service = new AuthorizationAuditService();
