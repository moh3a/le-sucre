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

export async function verify_paypal_signature(
  headers: Record<string, string>,
  body: string,
): Promise<{ valid: boolean; timestamp: number }> {
  const transmission_id = headers["paypal-transmission-id"];
  const transmission_sig = headers["paypal-transmission-sig"];
  const cert_url = headers["paypal-cert-url"];
  const auth_algo = headers["paypal-auth-algo"];
  const transmission_timestamp = headers["paypal-transmission-time"];

  if (!transmission_id || !transmission_sig || !cert_url || !auth_algo || !transmission_timestamp) {
    return { valid: false, timestamp: 0 };
  }

  const now = Math.floor(Date.now() / 1000);
  const ts = Math.floor(new Date(transmission_timestamp).getTime() / 1000);
  if (Math.abs(now - ts) > 300) {
    return { valid: false, timestamp: ts };
  }

  try {
    const cert_resp = await fetch(cert_url, { signal: AbortSignal.timeout(5000) });
    if (!cert_resp.ok) return { valid: false, timestamp: ts };
    const cert_pem = await cert_resp.text();

    const signed_string = [transmission_id, transmission_timestamp, "webhook", body].join("|");

    const key = await import_certificate_public_key(cert_pem);
    const sig_buffer = Buffer.from(transmission_sig, "base64");
    const data_buffer = Buffer.from(signed_string, "utf-8");

    const crypto = await import("crypto");
    const is_valid = crypto.verify(
      auth_algo === "RSA-SHA256" ? "sha256" : "sha256",
      data_buffer,
      key,
      sig_buffer,
    );

    return { valid: is_valid, timestamp: ts };
  } catch {
    return { valid: false, timestamp: ts };
  }
}

async function import_certificate_public_key(cert_pem: string): Promise<string> {
  const crypto = await import("crypto");
  const cert = new crypto.X509Certificate(cert_pem);
  return cert.publicKey.export({ type: "spki", format: "pem" }) as string;
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
