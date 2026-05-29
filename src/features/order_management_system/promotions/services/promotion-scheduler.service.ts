import "server-only";
import { generate_id } from "@/lib/utils";
import { db } from "@/lib/db";
import { promotion_jobs } from "../schema";
import { flash_sale_repository } from "../repositories/flash-sale.repository";
import { invalidate_promotion_cache } from "../helpers/invalidate-promotion-cache.helper";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class PromotionSchedulerService {
  schedule_flash_activation(flash_sale_id: string, run_at: string) {
    void audit_service.log({
      action: "promotion.flash_sale.schedule",
      resource_type: "flash_sale_id",
      resource_id: flash_sale_id,
    });
    return db.insert(promotion_jobs).values({
      id: generate_id(),
      job_type: "activate_flash",
      payload: { flash_sale_id },
      run_after: run_at,
    });
  }

  schedule_flash_deactivation(flash_sale_id: string, run_at: string) {
    return db.insert(promotion_jobs).values({
      id: generate_id(),
      job_type: "deactivate_flash",
      payload: { flash_sale_id },
      run_after: run_at,
    });
  }

  async activate_flash(flash_sale_id: string) {
    await flash_sale_repository.set_status(flash_sale_id, "active");
    void audit_service.log({
      action: "promotion.flash_sale.activate",
      resource_type: "flash_sale_id",
      resource_id: flash_sale_id,
    });
    await invalidate_promotion_cache();
  }

  async deactivate_flash(flash_sale_id: string) {
    await flash_sale_repository.set_status(flash_sale_id, "ended");
    await invalidate_promotion_cache();
  }
}

export const promotion_scheduler_service = new PromotionSchedulerService();
