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
