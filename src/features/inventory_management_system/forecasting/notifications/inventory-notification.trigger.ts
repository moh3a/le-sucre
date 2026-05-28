import "server-only";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";

/** Hook for email/SMS/Slack later — now logs + redis pub channel */
export async function trigger_inventory_notification(alert: {
  id: string;
  sku_id: string;
  alert_type: string;
  severity: string;
  message: string;
}) {
  await redis.publish(
    "inventory:alerts",
    JSON.stringify({ type: "inventory_alert", alert_id: alert.id, sku_id: alert.sku_id }),
  );
  logger.warn("inventory_alert", alert);
}
