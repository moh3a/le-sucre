import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => ({
  redis: {
    sadd: vi.fn(),
    sismember: vi.fn(),
    scard: vi.fn(),
    smembers: vi.fn(),
    srem: vi.fn(),
    setex: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
    hset: vi.fn(),
    hgetall: vi.fn(),
    pipeline: vi.fn(() => ({
      del: vi.fn(),
      exec: vi.fn().mockResolvedValue([]),
    })),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/authentication_and_authorization/auth/services/security-event.service", () => ({
  security_event_service: { log: vi.fn() },
}));

import { redis } from "@/lib/redis";
import { session_security_service } from "@/features/authentication_and_authorization/auth/services/session-security.service";
import type { Mock } from "vitest";

describe("SessionSecurityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("track_device", () => {
    it("adds device to user's device set", async () => {
      (redis.sadd as Mock).mockResolvedValue(1);
      (redis.expire as Mock).mockResolvedValue("OK");

      await session_security_service.track_device("user_1", {
        ip: "1.2.3.4",
        user_agent: "Mozilla/5.0",
      });

      expect(redis.sadd).toHaveBeenCalled();
      expect(redis.expire).toHaveBeenCalled();
    });
  });

  describe("enforce_session_limit", () => {
    it("allows sessions under the limit", async () => {
      (redis.scard as Mock).mockResolvedValue(5);

      const result = await session_security_service.enforce_session_limit("user_1");
      expect(result).toBe(true);
    });

    it("evicts oldest session at limit", async () => {
      (redis.scard as Mock).mockResolvedValue(10);
      (redis.smembers as Mock).mockResolvedValue(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]);
      (redis.srem as Mock).mockResolvedValue(1);

      const result = await session_security_service.enforce_session_limit("user_1");
      expect(result).toBe(false);
      expect(redis.srem).toHaveBeenCalled();
    });
  });

  describe("detect_suspicious_login", () => {
    it("detects IP change", () => {
      const reasons = session_security_service.detect_suspicious_login(
        { ip: "2.2.2.2", user_agent: "Chrome" },
        { ip: "1.1.1.1", user_agent: "Chrome" },
      );
      expect(reasons).toContain("login_from_different_ip");
    });

    it("detects browser change", () => {
      const reasons = session_security_service.detect_suspicious_login(
        { ip: "1.1.1.1", user_agent: "Firefox" },
        { ip: "1.1.1.1", user_agent: "Chrome" },
      );
      expect(reasons).toContain("login_from_different_browser");
    });

    it("returns empty for same device", () => {
      const reasons = session_security_service.detect_suspicious_login(
        { ip: "1.1.1.1", user_agent: "Chrome" },
        { ip: "1.1.1.1", user_agent: "Chrome" },
      );
      expect(reasons).toHaveLength(0);
    });
  });

  describe("rotate_session", () => {
    it("creates new token and stores mapping", async () => {
      (redis.setex as Mock).mockResolvedValue("OK");

      const result = await session_security_service.rotate_session("old_token");
      expect(result.new_token).toBeDefined();
      expect(result.new_token).not.toBe("old_token");
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe("revoke_session", () => {
    it("removes all session keys", async () => {
      (redis.del as Mock).mockResolvedValue(1);

      await session_security_service.revoke_session("token_123");
      expect(redis.del).toHaveBeenCalledTimes(3);
    });
  });

  describe("revoke_all_sessions", () => {
    it("removes all sessions for a user", async () => {
      (redis.smembers as Mock).mockResolvedValue(["tok1", "tok2", "tok3"]);

      const count = await session_security_service.revoke_all_sessions("user_1");
      expect(count).toBe(3);
      expect(redis.pipeline).toHaveBeenCalled();
    });
  });
});
