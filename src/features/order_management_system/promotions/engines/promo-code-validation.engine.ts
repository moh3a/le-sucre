import { ValidationError } from "@/lib/error_handling";

export function assert_promo_code_window(row: {
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}) {
  if (!row.is_active) throw new ValidationError("Code promo inactif");
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now) {
    throw new ValidationError("Code promo pas encore actif");
  }
  if (row.ends_at && new Date(row.ends_at).getTime() < now) {
    throw new ValidationError("Code promo expiré");
  }
}

export function assert_usage_limits(input: {
  usage_limit?: number | null;
  usage_count: number;
  per_customer_limit?: number | null;
  customer_usage_count: number;
}) {
  if (input.usage_limit != null && input.usage_count >= input.usage_limit) {
    throw new ValidationError("Code promo épuisé");
  }
  if (input.per_customer_limit != null && input.customer_usage_count >= input.per_customer_limit) {
    throw new ValidationError("Limite d'utilisation atteinte pour ce client");
  }
}
