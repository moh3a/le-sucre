import { describe, it, expect, vi, beforeEach } from "vitest";
import { login_protection_service } from "../login-protection";

const mockRedis = {
  ttl: vi.fn(),
  get: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  hgetall: vi.fn(),
  hset: vi.fn(),
};

vi.mock("@/lib/redis", () => ({
  redis: mockRedis,
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
  default: { log: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/authentication_and_authorization/auth/services/security-event.service", () => ({
  security_event_service: { log: vi.fn() },
}));

describe("LoginProtectionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("check_attempt", () => {
    it("allows login when no prior failures exist", async () => {
      mockRedis.ttl.mockResolvedValue(-2);
      mockRedis.get.mockResolvedValue(null);

      const result = await login_protection_service.check_attempt("1.2.3.4", "test@user.com");

      expect(result.allowed).toBe(true);
      expect(result.lockoutRemainingSec).toBe(0);
      expect(result.backoffDelayMs).toBe(0);
      expect(result.requiresCaptcha).toBe(false);
    });

    it("blocks login during active lockout", async () => {
      mockRedis.ttl.mockResolvedValue(500);

      const result = await login_protection_service.check_attempt("1.2.3.4", "test@user.com");

      expect(result.allowed).toBe(false);
      expect(result.lockoutRemainingSec).toBeGreaterThan(0);
      expect(result.requiresCaptcha).toBe(true);
    });
  });

  describe("record_failure", () => {
    it("increments failure counters and sets expiry", async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue("OK");
      mockRedis.get.mockResolvedValue(null);

      await login_protection_service.record_failure("1.2.3.4", "test@user.com");

      expect(mockRedis.incr).toHaveBeenCalledTimes(2);
      expect(mockRedis.expire).toHaveBeenCalledTimes(2);
    });
  });

  describe("record_success", () => {
    it("clears all failure counters and lockouts", async () => {
      mockRedis.del.mockResolvedValue(1);

      await login_protection_service.record_success("1.2.3.4", "test@user.com", "user_123");

      expect(mockRedis.del).toHaveBeenCalledTimes(5);
    });
  });
});
