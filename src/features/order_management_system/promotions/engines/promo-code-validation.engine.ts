import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { CART_DISCOUNT_ERROR } from "../constants/error-codes";

export function assert_promo_code_window(row: {
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}) {
  if (!row.is_active) throw_error(CART_DISCOUNT_ERROR.PROMO_CODE_NOT_FOUND);
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now) {
    throw_error(CART_DISCOUNT_ERROR.PROMO_CODE_NOT_FOUND);
  }
  if (row.ends_at && new Date(row.ends_at).getTime() < now) {
    throw_error(CART_DISCOUNT_ERROR.PROMO_CODE_EXPIRED);
  }
}

export function assert_usage_limits(input: {
  usage_limit?: number | null;
  usage_count: number;
  per_customer_limit?: number | null;
  customer_usage_count: number;
}) {
  if (input.usage_limit != null && input.usage_count >= input.usage_limit) {
    throw_error(CART_DISCOUNT_ERROR.PROMO_CODE_USAGE_EXCEEDED);
  }
  if (input.per_customer_limit != null && input.customer_usage_count >= input.per_customer_limit) {
    throw_error(CART_DISCOUNT_ERROR.PROMO_CODE_USAGE_EXCEEDED);
  }
}
