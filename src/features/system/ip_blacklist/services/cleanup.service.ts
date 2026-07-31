import "server-only";
import { ip_blacklist_service } from "./blacklist.service";
import { logger } from "@/lib/logger";

export async function cleanup_expired_blacklist_entries(): Promise<void> {
  const affected = await ip_blacklist_service.expire_old_entries();
  if (affected > 0) {
    logger.info("Expired blacklist entries cleaned up", { count: affected });
  }
}
