import "server-only";

import { auth } from "@/lib/auth";
import { session_security_service } from "@/features/authentication_and_authorization/auth/services/session-security.service";
import { security_event_service } from "@/features/authentication_and_authorization/auth/services/security-event.service";
import { logger } from "@/lib/logger";

export interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  user_id?: string;
}

export async function validate_session(req: Request): Promise<SessionValidationResult> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || !session.session) {
      return { valid: false, reason: "no_session" };
    }

    const session_token = session.session.token;
    if (!session_token) {
      return { valid: false, reason: "no_token" };
    }

    const user_id = session.user.id;

    const last_activity_key = `session:last_activity:${session_token}`;
    const { redis } = await import("@/lib/redis");
    const last_activity_raw = await redis.get(last_activity_key);
    const last_activity = last_activity_raw ? parseInt(last_activity_raw, 10) : Math.floor(Date.now() / 1000);

    const idle_timeout_min = Number(process.env.SESSION_IDLE_TIMEOUT_MINUTES) || 240;
    const idle_timeout_sec = idle_timeout_min * 60;
    const now = Math.floor(Date.now() / 1000);

    if (now - last_activity > idle_timeout_sec) {
      await security_event_service.log("session_terminated", "warning", {
        user_id,
        metadata: { reason: "idle_timeout", idle_seconds: now - last_activity },
      });
      return { valid: false, reason: "idle_timeout", user_id };
    }

    await redis.setex(`session:last_activity:${session_token}`, idle_timeout_sec, String(now));

    return { valid: true, user_id };
  } catch (error) {
    logger.error("Session validation error", { error: String(error) });
    return { valid: false, reason: "validation_error" };
  }
}
