import "server-only";
import type { z } from "zod";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { MODERATION_ERROR } from "../constants/error-codes";
import type { moderate_review_dto } from "../models/review.dto";
import { review_repository } from "../repositories/review.repository";
import { review_cache_service } from "./review-cache.service";
import { recompute_product_rating_aggregate } from "../engines/rating-aggregation.engine";
import { REVIEW_STATUS } from "../constants/review-status";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { format } from "date-fns";

export class ModerationService {
  async moderate(actor_user_id: string, input: z.infer<typeof moderate_review_dto>) {
    const review = await review_repository.find_by_id(input.review_id);
    if (!review) throw_error(MODERATION_ERROR.REVIEW_NOT_FOUND);

    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    await review_repository.update(review.id, {
      status: input.status,
      moderation_note: input.moderation_note ?? null,
      approved_at: input.status === REVIEW_STATUS.approved ? now : review.approved_at,
      rejected_at: input.status === REVIEW_STATUS.rejected ? now : review.rejected_at,
    });

    await review_repository.insert_moderation_event({
      id: generate_id(),
      review_id: review.id,
      actor_user_id,
      from_status: review.status,
      to_status: input.status,
      note: input.moderation_note ?? null,
    });

    if (input.status === REVIEW_STATUS.approved || review.status === REVIEW_STATUS.approved) {
      await recompute_product_rating_aggregate(review.product_id);
    }

    await review_cache_service.invalidate_product(review.product_id);
    void audit_service.log({
      action: "review.moderate",
      resource_type: "review_id",
      resource_id: input.review_id,
    });
    return review_repository.find_by_id(review.id);
  }

  admin_list(input: { page: number; limit: number; status?: string; product_id?: string }) {
    return review_repository.admin_list(input.page, input.limit, input.status, input.product_id);
  }

  stats() {
    return review_repository.stats();
  }

  rating_trends(days?: number) {
    return review_repository.rating_trends(days);
  }
}

export const moderation_service = new ModerationService();
