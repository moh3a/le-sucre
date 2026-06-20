import "server-only";

export interface RateLimitPreset {
  action: string;
  limit: number;
  window_sec: number;
  burst_limit?: number;
  burst_window_sec?: number;
}

export const RATE_LIMIT_PRESETS = {
  global_api: { action: "global", limit: 1000, window_sec: 60 },
  login: { action: "login", limit: 5, window_sec: 60, burst_limit: 3, burst_window_sec: 10 },
  register: { action: "register", limit: 3, window_sec: 3600 },
  password_reset: { action: "password_reset", limit: 3, window_sec: 900 },
  email_verification: { action: "email_verification", limit: 5, window_sec: 3600 },
  mfa_attempt: { action: "mfa_attempt", limit: 5, window_sec: 300 },
  checkout: { action: "checkout", limit: 10, window_sec: 300 },
  cart_add: { action: "cart_add", limit: 30, window_sec: 60 },
  search: { action: "search", limit: 30, window_sec: 60 },
  review_submit: { action: "review_submit", limit: 3, window_sec: 3600 },
  review_helpful: { action: "review_helpful", limit: 10, window_sec: 60 },
  file_upload: { action: "file_upload", limit: 10, window_sec: 300 },
  admin_api: { action: "admin_api", limit: 300, window_sec: 60 },
  admin_bulk: { action: "admin_bulk", limit: 20, window_sec: 60 },
  webhook: { action: "webhook", limit: 100, window_sec: 60 },
  analytics_events: { action: "analytics_events", limit: 200, window_sec: 60 },
  wishlist: { action: "wishlist", limit: 20, window_sec: 60 },
  export_csv: { action: "export_csv", limit: 5, window_sec: 300 },
  media_download: { action: "media_download", limit: 100, window_sec: 60 },
  invoice_download: { action: "invoice_download", limit: 20, window_sec: 60 },
  order_tracking: { action: "order_tracking", limit: 20, window_sec: 60 },
} as const satisfies Record<string, RateLimitPreset>;

export type RateLimitAction = keyof typeof RATE_LIMIT_PRESETS;
