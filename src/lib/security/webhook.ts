import "server-only";

import crypto from "crypto";

export interface WebhookVerificationResult {
  valid: boolean;
  timestamp: number | null;
  signature: string | null;
}

export function verify_hmac_signature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = "sha256",
): boolean {
  if (!secret || !signature || !payload) return false;
  const expected = crypto.createHmac(algorithm, secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verify_stripe_signature(
  payload: string,
  signature: string,
  secret: string,
  tolerance_sec: number = 300,
): { valid: boolean; timestamp: number } {
  const parts = signature.split(",");
  let timestamp = 0;
  let sig = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = parseInt(value, 10);
    if (key === "v1") sig = value;
  }

  if (!timestamp || !sig) return { valid: false, timestamp };

  const signed_payload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signed_payload).digest("hex");

  let matches = false;
  try {
    matches = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return { valid: false, timestamp };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance_sec) {
    return { valid: false, timestamp };
  }

  return { valid: matches, timestamp };
}

export function verify_paypal_signature(headers: Record<string, string>, body: string): boolean {
  const transmission_id = headers["paypal-transmission-id"];
  const transmission_sig = headers["paypal-transmission-sig"];
  const cert_url = headers["paypal-cert-url"];
  const auth_algo = headers["paypal-auth-algo"];

  if (!transmission_id || !transmission_sig || !cert_url || !auth_algo) return false;

  return true;
}

export function verify_webhook_timestamp(
  timestamp: string | number,
  tolerance_sec: number = 300,
): boolean {
  const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - ts) <= tolerance_sec;
}

export function generate_webhook_signature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
