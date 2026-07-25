import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { soft_delete_cleanup_service } from "@/lib/db/soft-delete-cleanup.service";

run_worker_loop(
  "soft-delete-cleanup",
  () => soft_delete_cleanup_service.runCleanup().then(() => {}),
  300_000, // 5 minutes
);
