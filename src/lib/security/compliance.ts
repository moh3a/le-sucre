import "server-only";

export const DATA_RETENTION_DAYS = {
  analytics_raw: 90,
  analytics_aggregate: 730,
  audit_logs: 365,
  sessions: 30,
  password_reset_tokens: 1,
  email_verification_tokens: 7,
  cart_abandoned: 30,
  deleted_account_data: 90,
  logs: 14,
};

/** Retention period (in days) before soft-deleted records are permanently purged. */
export const SOFT_DELETE_RETENTION_DAYS = {
  products: 30,
  categories: 30,
  brands: 30,
  warehouses: 30,
  promotions: 30,
  campaigns: 30,
  product_reviews: 14,
  product_skus: 30,
  product_properties: 30,
  property_values: 30,
  customers: 90,
  invoices: 365,
  feature_flags: 7,
  media: 30,
  wishlists: 30,
  /** Default retention for any entity not explicitly configured. */
  default: 30,
} as const;

export type SoftDeleteEntityType = keyof typeof SOFT_DELETE_RETENTION_DAYS;

export function get_retention_date(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export const CONSENT_TYPES = [
  "marketing_emails",
  "analytics_cookies",
  "third_party_sharing",
  "data_processing",
  "gdpr_data_export",
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

export class PrivacyService {
  get_data_retention_periods(): Record<string, number> {
    return { ...DATA_RETENTION_DAYS };
  }

  get_user_data_categories(): string[] {
    return [
      "profile_information",
      "order_history",
      "payment_information",
      "shipping_addresses",
      "browsing_history",
      "search_history",
      "review_history",
      "wishlist_items",
      "communication_preferences",
    ];
  }

  get_exportable_data_fields(): string[] {
    return [
      "name",
      "email",
      "phone",
      "orders",
      "addresses",
      "reviews",
      "wishlists",
      "consent_preferences",
      "account_creation_date",
    ];
  }
}

export const privacy_service = new PrivacyService();
