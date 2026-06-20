import { describe, it, expect } from "vitest";
import { redact, mask_email, mask_phone, RedactionService } from "../redaction";

describe("redact", () => {
  it("redacts passwords", () => {
    const result = redact({ password: "secret123", name: "John" });
    expect(result.password).toBe("[REDACTED]");
    expect(result.name).toBe("John");
  });

  it("redacts tokens", () => {
    const result = redact({ access_token: "eyJhbGciOiJIUzI1NiJ9", refresh_token: "abc123" });
    expect(result.access_token).toBe("[REDACTED]");
    expect(result.refresh_token).toBe("[REDACTED]");
  });

  it("redacts nested sensitive keys", () => {
    const result = redact({ user: { password: "secret", email: "test@test.com" } });
    expect((result.user as Record<string, unknown>).password).toBe("[REDACTED]");
    expect((result.user as Record<string, unknown>).email).toBe("test@test.com");
  });

  it("redacts API keys", () => {
    const result = redact({ api_key: "sk_live_12345", apiSecret: "whsec_abc" });
    expect(result.api_key).toBe("[REDACTED]");
    expect(result.apiSecret).toBe("[REDACTED]");
  });
});

describe("mask_email", () => {
  it("masks email", () => {
    expect(mask_email("john.doe@example.com")).toBe("j***e@example.com");
  });
});

describe("mask_phone", () => {
  it("masks phone number", () => {
    expect(mask_phone("0555123456")).toBe("055****456");
  });
});

describe("RedactionService", () => {
  it("safe_user masks email", () => {
    const svc = new RedactionService();
    const result = svc.safe_user({ id: "abc", name: "John", email: "john@test.com" });
    expect(result.email).not.toBe("john@test.com");
    expect(result.email).toContain("***");
    expect(result.id).toBe("abc");
  });
});
