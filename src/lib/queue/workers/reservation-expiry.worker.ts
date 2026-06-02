import "dotenv/config";
import { run_worker_loop } from "@/lib/queue/job-runner";
import { reservation_service } from "@/features/inventory_management_system/inventory/services/reservation.service";

run_worker_loop("reservation-expiry", () => reservation_service.expire_stale().then(() => {}), 10000);
