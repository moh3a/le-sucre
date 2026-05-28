import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { index_job_runner_service } from "./services/index-job-runner.service";

run_worker_loop("recommendations-index", () => index_job_runner_service.run_due(25), 5000);
