import "server-only";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { security_event_service } from "@/features/authentication_and_authorization/auth/services/security-event.service";

export interface LoginCheckResult {
  allowed: boolean;
  lockoutRemainingSec: number;
  backoffDelayMs: number;
  requiresCaptcha: boolean;
}

export class LoginProtectionService {
  private readonly MAX_FAILED_ATTEMPTS: number;
  private readonly INITIAL_LOCKOUT_SEC: number;
  private readonly WINDOW_SEC = 86400;
  private readonly CAPTCHA_AFTER: number;

  constructor() {
    this.MAX_FAILED_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;
    this.INITIAL_LOCKOUT_SEC = (Number(process.env.LOGIN_LOCKOUT_MINUTES) || 15) * 60;
    this.CAPTCHA_AFTER = Number(process.env.LOGIN_CAPTCHA_AFTER) || 3;
  }

  /**
   * Check if login attempt is allowed for given IP and identifier.
   * Calculates lockout state and backoff delays.
   */
  async check_attempt(ip: string, identifier: string): Promise<LoginCheckResult> {
    const ipAttemptsKey = `login:attempts:ip:${ip}`;
    const idAttemptsKey = `login:attempts:id:${identifier}`;
    const ipLockoutKey = `login:lockout:ip:${ip}`;
    const idLockoutKey = `login:lockout:id:${identifier}`;

    // 1. Check active lockout
    const [ipLockRemaining, idLockRemaining] = await Promise.all([
      redis.ttl(ipLockoutKey),
      redis.ttl(idLockoutKey),
    ]);

    const maxLockRemaining = Math.max(
      ipLockRemaining > 0 ? ipLockRemaining : 0,
      idLockRemaining > 0 ? idLockRemaining : 0
    );

    if (maxLockRemaining > 0) {
      return {
        allowed: false,
        lockoutRemainingSec: maxLockRemaining,
        backoffDelayMs: 0,
        requiresCaptcha: true,
      };
    }

    // 2. Fetch failed attempts count
    const [ipFailuresRaw, idFailuresRaw] = await Promise.all([
      redis.get(ipAttemptsKey),
      redis.get(idAttemptsKey),
    ]);

    const ipFailures = ipFailuresRaw ? parseInt(ipFailuresRaw, 10) : 0;
    const idFailures = idFailuresRaw ? parseInt(idFailuresRaw, 10) : 0;
    const maxFailures = Math.max(ipFailures, idFailures);

    // 3. CAPTCHA requirement
    const requiresCaptcha = maxFailures >= this.CAPTCHA_AFTER;

    // 4. Calculate backoff delay (exponential: 3 failures = 5s, 4 failures = 15s)
    let backoffDelayMs = 0;
    if (maxFailures === 3) {
      backoffDelayMs = 5000;
    } else if (maxFailures === 4) {
      backoffDelayMs = 15000;
    }

    return {
      allowed: true,
      lockoutRemainingSec: 0,
      backoffDelayMs,
      requiresCaptcha,
    };
  }

  /**
   * Log a failed login attempt. Increments count and applies temporary lockouts if threshold exceeded.
   */
  async record_failure(ip: string, identifier: string, userId?: string): Promise<void> {
    const ipAttemptsKey = `login:attempts:ip:${ip}`;
    const idAttemptsKey = `login:attempts:id:${identifier}`;
    const ipLockoutKey = `login:lockout:ip:${ip}`;
    const idLockoutKey = `login:lockout:id:${identifier}`;

    // Increment failed attempts
    const [newIpCount, newIdCount] = await Promise.all([
      redis.incr(ipAttemptsKey),
      redis.incr(idAttemptsKey),
    ]);

    // Set expiry for attempt track counters
    await Promise.all([
      redis.expire(ipAttemptsKey, this.WINDOW_SEC),
      redis.expire(idAttemptsKey, this.WINDOW_SEC),
    ]);

    const maxFailures = Math.max(newIpCount, newIdCount);

    // Apply lockout if attempts exceed limit
    if (maxFailures >= this.MAX_FAILED_ATTEMPTS) {
      // Exponentially increase lockout duration based on how many lockouts occurred
      const lockoutHistoryKey = `login:lockouthistory:${identifier}`;
      const lockoutCountRaw = await redis.get(lockoutHistoryKey);
      const lockoutCount = lockoutCountRaw ? parseInt(lockoutCountRaw, 10) : 0;
      
      const duration = this.INITIAL_LOCKOUT_SEC * Math.pow(2, lockoutCount); // Double lockout time each time
      
      await Promise.all([
        redis.setex(ipLockoutKey, duration, "1"),
        redis.setex(idLockoutKey, duration, "1"),
        redis.incr(lockoutHistoryKey),
        redis.expire(lockoutHistoryKey, 604800), // Keep history for 7 days
      ]);

      await security_event_service.log("account_locked", "warning", {
        user_id: userId,
        ip_address: ip,
        metadata: { identifier, lockoutDurationSec: duration },
      });

      logger.warn(`Account locked due to brute force protection`, {
        ip,
        identifier,
        lockoutCount,
        duration,
      });
    }

    await security_event_service.log("login_failure", "info", {
      user_id: userId,
      ip_address: ip,
      metadata: { identifier, attemptsCount: maxFailures },
    });
  }

  /**
   * Reset failed login attempt counters and lockout histories on successful authentication.
   */
  async record_success(ip: string, identifier: string, userId: string): Promise<void> {
    const ipAttemptsKey = `login:attempts:ip:${ip}`;
    const idAttemptsKey = `login:attempts:id:${identifier}`;
    const ipLockoutKey = `login:lockout:ip:${ip}`;
    const idLockoutKey = `login:lockout:id:${identifier}`;
    const lockoutHistoryKey = `login:lockouthistory:${identifier}`;

    await Promise.all([
      redis.del(ipAttemptsKey),
      redis.del(idAttemptsKey),
      redis.del(ipLockoutKey),
      redis.del(idLockoutKey),
      redis.del(lockoutHistoryKey),
    ]);

    await security_event_service.log("login_success", "info", {
      user_id: userId,
      ip_address: ip,
    });
  }

  /**
   * Detect impossible travel. Compares geolocations/timestamps of subsequent logins.
   */
  async check_impossible_travel(
    userId: string,
    currentIp: string,
    currentCountry: string | null
  ): Promise<boolean> {
    if (!currentCountry) return false;

    const lastGeoKey = `user:lastgeo:${userId}`;
    const lastGeo = await redis.hgetall(lastGeoKey);

    const now = Math.floor(Date.now() / 1000);

    if (lastGeo && lastGeo.country && lastGeo.timestamp) {
      const lastCountry = lastGeo.country;
      const lastTime = parseInt(lastGeo.timestamp, 10);
      const timeDeltaHours = (now - lastTime) / 3600;

      // If different country under 4 hours (impossible/highly suspicious travel speed)
      if (lastCountry !== currentCountry && timeDeltaHours < 4) {
        await security_event_service.log("login_suspicious", "critical", {
          user_id: userId,
          ip_address: currentIp,
          metadata: {
            reason: "impossible_travel",
            last_country: lastCountry,
            current_country: currentCountry,
            time_delta_hours: timeDeltaHours,
          },
        });
        logger.warn(`Suspicious login / impossible travel detected for user ${userId}`, {
          lastCountry,
          currentCountry,
          timeDeltaHours,
        });
        return true;
      }
    }

    // Update last geo data
    await redis.hset(lastGeoKey, {
      country: currentCountry,
      ip: currentIp,
      timestamp: String(now),
    });
    await redis.expire(lastGeoKey, 86400 * 30); // Cache for 30 days

    return false;
  }
}

export const login_protection_service = new LoginProtectionService();
