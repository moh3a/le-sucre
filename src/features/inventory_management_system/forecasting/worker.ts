import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { forecast_job_runner_service } from "./services/forecast-job-runner.service";

run_worker_loop("inventory-forecast", () => forecast_job_runner_service.run_due(25), 10_000);
