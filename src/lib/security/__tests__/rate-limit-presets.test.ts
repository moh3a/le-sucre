import { describe, it, expect } from "vitest";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit-presets";

describe("Rate Limit Presets", () => {
  it("defines all required presets", () => {
    const required = [
      "login", "register", "password_reset", "email_verification",
      "mfa_attempt", "checkout", "cart_add", "search",
      "review_submit", "review_helpful", "file_upload",
      "admin_api", "admin_bulk", "webhook", "analytics_events",
      "wishlist", "export_csv", "media_download", "invoice_download",
      "order_tracking",
    ];
    for (const preset of required) {
      expect(RATE_LIMIT_PRESETS).toHaveProperty(preset);
    }
  });

  it("login has strict limits", () => {
    expect(RATE_LIMIT_PRESETS.login.limit).toBeLessThanOrEqual(10);
    expect(RATE_LIMIT_PRESETS.login.window_sec).toBe(60);
  });

  it("register has very strict limits", () => {
    expect(RATE_LIMIT_PRESETS.register.limit).toBeLessThanOrEqual(5);
    expect(RATE_LIMIT_PRESETS.register.window_sec).toBeGreaterThanOrEqual(3600);
  });

  it("admin API has reasonable limits", () => {
    expect(RATE_LIMIT_PRESETS.admin_api.limit).toBeGreaterThan(100);
    expect(RATE_LIMIT_PRESETS.admin_api.limit).toBeLessThanOrEqual(500);
  });

  it("file upload has size limits", () => {
    expect(RATE_LIMIT_PRESETS.file_upload.limit).toBeLessThanOrEqual(20);
  });
});
