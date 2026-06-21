import "dotenv/config";
import { cleanup_expired_blacklist_entries } from "@/features/ip_blacklist/services/cleanup.service";
import { logger } from "@/lib/logger";

cleanup_expired_blacklist_entries()
  .then(() => {
    logger.info("Blacklist expiry cleanup completed");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Blacklist expiry cleanup failed", { err });
    process.exit(1);
  });
