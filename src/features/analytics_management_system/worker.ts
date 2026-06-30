import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { aggregation_job_runner_service } from "./services/aggregation-job-runner.service";
import { cart_abandonment_service } from "./services/cart-abandonment.service";

run_worker_loop("analytics", async () => {
  await aggregation_job_runner_service.run_due(10);
  await cart_abandonment_service.track_abandoned();
}, 60_000);
