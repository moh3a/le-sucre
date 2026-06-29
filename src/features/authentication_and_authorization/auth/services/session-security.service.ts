import "server-only";

import crypto from "crypto";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { security_event_service } from "@/features/authentication_and_authorization/auth/services/security-event.service";

const CONFIG = {
  MAX_SESSIONS_PER_USER: 10,
  SESSION_IDLE_TIMEOUT_SEC: 60 * 60 * 4,
  SESSION_ABSOLUTE_TIMEOUT_SEC: 60 * 60 * 24 * 7,
  DEVICE_EXPIRY_SEC: 60 * 60 * 24 * 30,
  SUSPICIOUS_TRAVEL_KM: 500,
  SUSPICIOUS_TRAVEL_HOURS: 4,
};

interface DeviceFingerprint {
  ip: string;
  user_agent: string;
  accept_language?: string;
  sec_ch_ua?: string;
}

export class SessionSecurityService {
  async track_device(user_id: string, fingerprint: DeviceFingerprint): Promise<void> {
    const key = `session:devices:${user_id}`;
    const device_id = this.hash_fingerprint(fingerprint);
    await redis.sadd(key, device_id);
    await redis.expire(key, CONFIG.DEVICE_EXPIRY_SEC);
  }

  async is_known_device(user_id: string, fingerprint: DeviceFingerprint): Promise<boolean> {
    const key = `session:devices:${user_id}`;
    const device_id = this.hash_fingerprint(fingerprint);
    const exists = await redis.sismember(key, device_id);
    return exists === 1;
  }

  detect_suspicious_login(
    current: DeviceFingerprint,
    previous: DeviceFingerprint | null,
  ): string[] {
    const reasons: string[] = [];
    if (!previous) return reasons;

    if (current.ip !== previous.ip) {
      reasons.push("login_from_different_ip");
    }

    if (
      current.user_agent !== previous.user_agent &&
      this.normalize_ua(current.user_agent) !== this.normalize_ua(previous.user_agent)
    ) {
      reasons.push("login_from_different_browser");
    }

    return reasons;
  }

  async enforce_session_limit(user_id: string): Promise<boolean> {
    const key = `session:active:${user_id}`;
    const count = await redis.scard(key);
    if (count >= CONFIG.MAX_SESSIONS_PER_USER) {
      const members = await redis.smembers(key);
      const sorted = members.sort();
      const oldest = sorted[0];
      if (oldest) {
        await redis.srem(key, oldest);
        logger.warn("Session limit reached, evicted oldest session", { user_id, count });
        await security_event_service.log("session_terminated", "warning", {
          user_id,
          metadata: { reason: "session_limit_reached", count },
        });
      }
      return false;
    }
    return true;
  }

  async track_active_session(user_id: string, session_token: string): Promise<void> {
    const key = `session:active:${user_id}`;
    await redis.sadd(key, session_token);
    await redis.expire(key, CONFIG.SESSION_ABSOLUTE_TIMEOUT_SEC);
  }

  async remove_active_session(user_id: string, session_token: string): Promise<void> {
    const key = `session:active:${user_id}`;
    await redis.srem(key, session_token);
  }

  async check_idle_timeout(session_token: string, last_activity_at: number): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const idle_sec = now - last_activity_at;
    if (idle_sec > CONFIG.SESSION_IDLE_TIMEOUT_SEC) {
      await redis.del(`session:active:${session_token}`);
      return false;
    }
    await redis.setex(`session:last_activity:${session_token}`, CONFIG.SESSION_IDLE_TIMEOUT_SEC, String(now));
    return true;
  }

  async rotate_session(session_token: string): Promise<{ new_token: string }> {
    const new_token = crypto.randomUUID();
    const key = `session:rotate:${session_token}`;
    await redis.setex(key, 300, new_token);
    return { new_token };
  }

  async revoke_session(session_token: string): Promise<void> {
    await redis.del(`session:active:${session_token}`);
    await redis.del(`session:last_activity:${session_token}`);
    await redis.del(`session:rotate:${session_token}`);
  }

  async revoke_all_sessions(user_id: string): Promise<number> {
    const key = `session:active:${user_id}`;
    const tokens = await redis.smembers(key);
    if (tokens.length > 0) {
      const pipeline = redis.pipeline();
      for (const token of tokens) {
        pipeline.del(`session:active:${token}`);
        pipeline.del(`session:last_activity:${token}`);
        pipeline.del(`session:rotate:${token}`);
      }
      pipeline.del(key);
      await pipeline.exec();
    }
    return tokens.length;
  }

  async list_active_sessions(user_id: string): Promise<string[]> {
    const key = `session:active:${user_id}`;
    return redis.smembers(key);
  }

  async get_session_device_info(session_token: string): Promise<DeviceFingerprint | null> {
    const key = `session:device:${session_token}`;
    const data = await redis.hgetall(key);
    if (!data || !data.ip) return null;
    return {
      ip: data.ip!,
      user_agent: data.user_agent ?? "",
      accept_language: data.accept_language,
      sec_ch_ua: data.sec_ch_ua,
    };
  }

  async store_session_device(session_token: string, fingerprint: DeviceFingerprint): Promise<void> {
    const key = `session:device:${session_token}`;
    await redis.hset(key, {
      ip: fingerprint.ip,
      user_agent: fingerprint.user_agent,
      accept_language: fingerprint.accept_language ?? "",
      sec_ch_ua: fingerprint.sec_ch_ua ?? "",
    });
    await redis.expire(key, CONFIG.DEVICE_EXPIRY_SEC);
  }

  private hash_fingerprint(fingerprint: DeviceFingerprint): string {
    const raw = `${fingerprint.ip}|${fingerprint.user_agent}|${fingerprint.accept_language ?? ""}|${fingerprint.sec_ch_ua ?? ""}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  private normalize_ua(ua: string): string {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/\d+/);
    return match ? match[0] : ua.substring(0, 50);
  }
}

export const session_security_service = new SessionSecurityService();
