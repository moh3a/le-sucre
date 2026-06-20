import "server-only";

const SENSITIVE_KEYS = new Set([
  "password",
  "password_hash",
  "passwordHash",
  "hashed_password",
  "access_token",
  "refresh_token",
  "id_token",
  "accessToken",
  "refreshToken",
  "session_token",
  "token",
  "secret",
  "api_key",
  "apiKey",
  "api_secret",
  "apiSecret",
  "client_secret",
  "webhook_secret",
  "webhookSecret",
  "stripe_secret_key",
  "stripeSecretKey",
  "paypal_client_secret",
  "paypalClientSecret",
  "authorization",
  "x-api-key",
  "x-csrf-token",
  "x-auth-token",
  "otp",
  "totp_secret",
  "totpSecret",
  "backup_codes",
  "backupCodes",
  "mfa_secret",
  "mfaSecret",
  "reset_token",
  "resetToken",
  "verification_token",
  "verificationToken",
  "jwt",
  "jwt_token",
  "private_key",
  "privateKey",
]);

const REDACTED = "[REDACTED]";

function is_sensitive_key(key: string): boolean {
  const lower = key.toLowerCase().replace(/[_-]/g, "");
  return (
    SENSITIVE_KEYS.has(key) ||
    SENSITIVE_KEYS.has(lower) ||
    lower.includes("password") ||
    lower.includes("secret") ||
    lower.includes("token") ||
    lower.includes("apikey") ||
    lower.includes("apisecret")
  );
}

function redact_value(value: unknown, depth = 0): unknown {
  if (depth > 10) return REDACTED;
  if (typeof value === "string") {
    if (value.length > 100 && !value.includes(" ")) return value.substring(0, 8) + "...[TRUNCATED]";
    return value;
  }
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) return value.map((v) => redact_value(v, depth + 1));
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      redacted[key] = is_sensitive_key(key) ? REDACTED : redact_value(val, depth + 1);
    }
    return redacted;
  }
  return value;
}

export function redact<T>(data: T): T {
  if (typeof data !== "object" || data === null) return data;
  return redact_value(data, 0) as T;
}

export function redacted_logger(): (data: Record<string, unknown>) => Record<string, unknown> {
  return (data: Record<string, unknown>) => redact_value(data, 0) as Record<string, unknown>;
}

export function mask_email(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

export function mask_phone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.substring(0, 3) + "****" + phone.substring(phone.length - 3);
}

export function mask_name(name: string): string {
  if (name.length < 2) return name;
  const parts = name.split(" ");
  return parts.map((p) => p[0] + "***").join(" ");
}

export class RedactionService {
  redact<T>(data: T): T {
    return redact(data);
  }

  safe_user(user: { id: string; name?: string | null; email?: string | null }): {
    id: string;
    name: string | null;
    email: string | null;
  } {
    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email ? mask_email(user.email) : null,
    };
  }

  safe_customer(customer: Record<string, unknown>): Record<string, unknown> {
    const safe = { ...customer };
    if (safe.email) safe.email = mask_email(safe.email as string);
    if (safe.phone) safe.phone = mask_phone(safe.phone as string);
    if (safe.name) safe.name = mask_name(safe.name as string);
    delete safe.password;
    delete safe.password_hash;
    delete safe.access_token;
    delete safe.refresh_token;
    return safe;
  }
}

export const redaction_service = new RedactionService();
