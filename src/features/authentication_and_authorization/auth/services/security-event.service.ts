import "server-only";
import { db } from "@/lib/db";
import { security_events } from "@/features/authentication_and_authorization/auth/mfa_schema";
import { generate_id } from "@/lib/utils";

type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "login_suspicious"
  | "logout"
  | "password_change"
  | "password_reset"
  | "email_verification"
  | "mfa_enabled"
  | "mfa_disabled"
  | "mfa_failure"
  | "session_terminated"
  | "account_locked"
  | "account_unlocked"
  | "rate_limit_hit"
  | "csrf_failure"
  | "invalid_origin"
  | "webhook_failure"
  | "api_key_created"
  | "api_key_revoked"
  | "export_downloaded"
  | "sensitive_data_accessed"
  | "impersonation_started"
  | "impersonation_ended"
  | "role_changed"
  | "permission_changed"
  | "user_banned"
  | "user_unbanned";

type Severity = "info" | "warning" | "error" | "critical";

export class SecurityEventService {
  async log(
    event_type: SecurityEventType,
    severity: Severity = "info",
    options?: {
      user_id?: string;
      ip_address?: string;
      user_agent?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    try {
      await db.insert(security_events).values({
        id: generate_id(),
        event_type,
        severity,
        user_id: options?.user_id ?? null,
        ip_address: options?.ip_address ?? null,
        user_agent: options?.user_agent ?? null,
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null,
      });
    } catch {
      // Silently fail for security events to avoid cascading failures
    }
  }
}

export const security_event_service = new SecurityEventService();
