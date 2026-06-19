import { payment_retry_service } from "./services/payment-retry.service";
import { logger } from "@/lib/logger";

export async function loop() {
  while (true) {
    try {
      const retry_results = await payment_retry_service.retry_all_failed(3);
      if (retry_results.length > 0) {
        logger.info("payment_retry", {
          attempted: retry_results.length,
          succeeded: retry_results.filter((r) => r.success).length,
        });
      }

      const expired_results = await payment_retry_service.expire_stale_payments(24);
      if (expired_results.length > 0) {
        logger.info("payment_expiry", {
          expired: expired_results.length,
        });
      }
    } catch (e) {
      logger.error("payment_worker_error", { error: (e as Error).message });
    }

    await new Promise((r) => setTimeout(r, 30_000));
  }
}
