import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { promotion_job_runner_service } from "./services/promotion-job-runner.service";

run_worker_loop("promotions", () => promotion_job_runner_service.run_due(25), 5000);
