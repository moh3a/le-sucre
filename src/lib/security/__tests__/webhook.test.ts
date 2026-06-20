import { describe, it, expect } from "vitest";
import { verify_hmac_signature, verify_stripe_signature, verify_webhook_timestamp, generate_webhook_signature } from "../webhook";

describe("verify_hmac_signature", () => {
  it("verifies valid HMAC signature", () => {
    const payload = '{"event":"test"}';
    const secret = "whsec_test";
    const signature = generate_webhook_signature(payload, secret);
    expect(verify_hmac_signature(payload, signature, secret)).toBe(true);
  });

  it("rejects invalid signature", () => {
    const payload = '{"event":"test"}';
    expect(verify_hmac_signature(payload, "invalid_sig", "whsec_test")).toBe(false);
  });

  it("rejects empty signature", () => {
    expect(verify_hmac_signature('{"event":"test"}', "", "whsec_test")).toBe(false);
  });
});

describe("verify_webhook_timestamp", () => {
  it("accepts recent timestamp", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(verify_webhook_timestamp(now)).toBe(true);
  });

  it("rejects old timestamp", () => {
    const old = Math.floor(Date.now() / 1000) - 3600;
    expect(verify_webhook_timestamp(old)).toBe(false);
  });
});

describe("verify_stripe_signature", () => {
  it("rejects empty signature", () => {
    const result = verify_stripe_signature('{}', "", "whsec_test");
    expect(result.valid).toBe(false);
  });

  it("rejects malformed signature", () => {
    const result = verify_stripe_signature('{}', "invalid", "whsec_test");
    expect(result.valid).toBe(false);
  });
});
