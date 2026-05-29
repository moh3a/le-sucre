import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { aggregation_job_runner_service } from "./services/aggregation-job-runner.service";

run_worker_loop("analytics", () => aggregation_job_runner_service.run_due(10), 60_000);
