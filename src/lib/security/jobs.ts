import "server-only";

import { z } from "zod";
import { logger } from "@/lib/logger";

export const JOB_RETRY_LIMITS: Record<string, number> = {
  shipping_creation: 3,
  shipping_tracking: 5,
  payment_processing: 3,
  payment_webhook: 3,
  reservation_expiry: 1,
  email_notification: 3,
  analytics_aggregation: 2,
  campaign_activation: 2,
  inventory_forecast: 2,
  recommendation_update: 2,
  order_expiry: 1,
};

const JOB_TIMEOUTS: Record<string, number> = {
  shipping_creation: 30000,
  payment_processing: 30000,
  email_notification: 10000,
  default: 60000,
};

export function get_job_timeout(job_type: string): number {
  return JOB_TIMEOUTS[job_type] ?? JOB_TIMEOUTS.default;
}

export function validate_job_payload(job_type: string, payload: unknown): boolean {
  switch (job_type) {
    case "shipping_creation":
      return z
        .object({ order_id: z.string().min(1), shipment_id: z.string().min(1) })
        .safeParse(payload).success;
    case "payment_processing":
      return z
        .object({ order_id: z.string().min(1), payment_id: z.string().min(1) })
        .safeParse(payload).success;
    case "email_notification":
      return z.object({ to: z.string().email(), subject: z.string().min(1) }).safeParse(payload)
        .success;
    case "reservation_expiry":
      return z.object({ reservation_id: z.string().min(1) }).safeParse(payload).success;
    default:
      return typeof payload === "object" && payload !== null;
  }
}

export function sanitize_job_payload(payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      sanitized[key] = value.replace(/[<>"'&]/g, "").substring(0, 5000);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function should_retry_job(job_type: string, attempt: number, error: Error): boolean {
  const max_retries = JOB_RETRY_LIMITS[job_type] ?? 3;
  if (attempt >= max_retries) return false;
  if (error.message.includes("rate limit") || error.message.includes("429")) return true;
  if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) return true;
  if (error.message.includes("ECONNRESET")) return true;
  if (error.message.includes("Internal Server Error")) return false;
  return true;
}
