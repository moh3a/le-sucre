import "server-only";

const SENSITIVE_FIELDS = new Set([
  "password", "password_hash", "passwordHash", "hashed_password",
  "access_token", "refresh_token", "id_token", "session_token",
  "token", "secret", "api_key", "apiKey", "api_secret", "apiSecret",
  "client_secret", "webhook_secret", "webhookSecret",
  "stripe_secret_key", "stripeSecretKey",
  "paypal_client_secret", "paypalClientSecret",
  "authorization", "x-api-key", "x-csrf-token", "x-auth-token",
  "otp", "totp_secret", "totpSecret", "backup_codes", "backupCodes",
  "mfa_secret", "mfaSecret", "reset_token", "resetToken",
  "verification_token", "verificationToken",
  "jwt", "jwt_token", "private_key", "privateKey",
  "stripe_customer_id", "paypal_payer_id",
  "internal_notes", "audit_metadata",
]);

const REDACTED = "[REDACTED]";

function is_sensitive(key: string): boolean {
  const lower = key.toLowerCase().replace(/[_-]/g, "");
  return SENSITIVE_FIELDS.has(key) || SENSITIVE_FIELDS.has(lower)
    || lower.includes("password") || lower.includes("secret")
    || lower.includes("token") || lower.includes("apikey")
    || lower.includes("apisecret") || lower.includes("privatekey");
}

function redact_deep(value: unknown, depth = 0): unknown {
  if (depth > 10) return REDACTED;
  if (typeof value === "string") {
    if (value.length > 200 && !value.includes(" ")) return value.substring(0, 16) + "...[TRUNCATED]";
    return value;
  }
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) return value.map((v) => redact_deep(v, depth + 1));
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = is_sensitive(key) ? REDACTED : redact_deep(val, depth + 1);
    }
    return result;
  }
  return value;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
}

export interface SafeOrder {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  item_count: number;
}

export interface SafeCustomer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  order_count: number;
  total_spent_cents: number;
}

export class DataSerializer {
  serialize<T>(data: T): T {
    return redact_deep(data, 0) as T;
  }

  safe_user(user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    password?: string;
    password_hash?: string;
    access_token?: string;
    refresh_token?: string;
    [key: string]: unknown;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email ? this.mask_email(user.email) : "",
      name: user.name ?? null,
      role: user.role ?? null,
    };
  }

  safe_customer(customer: Record<string, unknown>): SafeCustomer {
    return {
      id: customer.id as string,
      email: this.mask_email((customer.email as string) ?? ""),
      name: customer.name ? this.mask_name(customer.name as string) : null,
      phone: customer.phone ? this.mask_phone(customer.phone as string) : null,
      order_count: (customer.order_count as number) ?? 0,
      total_spent_cents: (customer.total_spent_cents as number) ?? 0,
    };
  }

  safe_order(order: Record<string, unknown>): SafeOrder {
    return {
      id: order.id as string,
      status: order.status as string,
      total_cents: (order.total_cents as number) ?? 0,
      currency: (order.currency as string) ?? "EUR",
      created_at: (order.created_at as string) ?? "",
      item_count: (order.item_count as number) ?? 0,
    };
  }

  paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data: this.serialize(data),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_more: page * limit < total,
      },
    };
  }

  mask_email(email: string): string {
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    return `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`;
  }

  mask_phone(phone: string): string {
    if (phone.length < 6) return phone;
    return phone.substring(0, 3) + "****" + phone.substring(phone.length - 3);
  }

  mask_name(name: string): string {
    if (name.length < 2) return name;
    const parts = name.split(" ");
    return parts.map((p) => p[0] + "***").join(" ");
  }
}

export const data_serializer = new DataSerializer();
