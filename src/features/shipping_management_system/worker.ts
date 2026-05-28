import "dotenv/config";
import { shipping_job_runner_service } from "./services/shipping-job-runner.service";
import logger from "@/lib/logger";
export async function loop() {
  while (true) {
    try {
      await shipping_job_runner_service.run_due(25);
    } catch (e) {
      logger.info("Shipping worker error: no-op, keep worker alive.", e);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}
