import "server-only";

import crypto from "crypto";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";

interface DeviceFingerprint {
  ip: string;
  user_agent: string;
  accept_language?: string;
  sec_ch_ua?: string;
}

export class SessionSecurityService {
  private readonly SUSPICIOUS_THRESHOLD_KM = 500;
  private readonly MAX_SESSIONS_PER_USER = 10;

  async track_device(user_id: string, fingerprint: DeviceFingerprint): Promise<void> {
    const key = `session:devices:${user_id}`;
    const device_id = this.hash_fingerprint(fingerprint);
    await redis.sadd(key, device_id);
    await redis.expire(key, 60 * 60 * 24 * 30);
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
      const current_country = this.extract_country(current.ip);
      const previous_country = this.extract_country(previous.ip);
      if (current_country && previous_country && current_country !== previous_country) {
        reasons.push("login_from_different_country");
      }
    }

    if (
      current.user_agent !== previous.user_agent &&
      this.normalize_ua(current.user_agent) !== this.normalize_ua(previous.user_agent)
    ) {
      reasons.push("login_from_different_browser");
    }

    return reasons;
  }

  async enforce_session_limit(user_id: string): Promise<void> {
    const key = `session:count:${user_id}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 300);
    if (count > this.MAX_SESSIONS_PER_USER) {
      await redis.expire(key, 60);
    }
  }

  async rotate_session(session_token: string): Promise<string> {
    const new_token = crypto.randomUUID();
    const key = `session:rotate:${session_token}`;
    await redis.setex(key, 300, new_token);
    return new_token;
  }

  async invalidate_other_sessions(user_id: string, current_session_id: string): Promise<void> {
    const key = `session:invalidate:${user_id}:${Date.now()}`;
    await redis.setex(key, 60, current_session_id);
  }

  private hash_fingerprint(fingerprint: DeviceFingerprint): string {
    const raw = `${fingerprint.ip}|${fingerprint.user_agent}|${fingerprint.accept_language ?? ""}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  private normalize_ua(ua: string): string {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/\d+/);
    return match ? match[0] : ua.substring(0, 50);
  }

  private extract_country(_ip: string): string | null {
    return null;
  }
}

export const session_security_service = new SessionSecurityService();
