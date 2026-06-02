import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { preorder_fulfillment_service } from "./services/preorder-fulfillment.service";

run_worker_loop("preorders-fulfillment", async () => {
  await preorder_fulfillment_service.fulfill_all_confirmed();
}, 10000);
