import "server-only";
import logger from "@/lib/logger";

export type JobHandler = () => Promise<void>;

export async function run_worker_loop(name: string, handler: JobHandler, interval_ms = 5000) {
  logger.info("worker_started", { name });
  while (true) {
    const started = Date.now();
    try {
      await handler();
    } catch (error) {
      logger.error("worker_tick_failed", { name, error });
    }
    const elapsed = Date.now() - started;
    const sleep = Math.max(250, interval_ms - elapsed);
    await new Promise((r) => setTimeout(r, sleep));
  }
}
