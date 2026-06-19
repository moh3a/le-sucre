import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { promotion_review_service } from "../services/promotion-review.service";

export const promotion_review_router = create_trpc_router({
  promotionRequestReview: permission_procedure(PERMISSIONS.promotions_write)
    .input(z.object({ promotion_id: z.string(), review_type: z.string() }))
    .mutation(({ ctx, input }) => promotion_review_service.request_review({ ...input, requested_by_user_id: ctx.session!.user.id })),

  promotionReview: permission_procedure(PERMISSIONS.promotions_write)
    .input(z.object({ id: z.string(), status: z.enum(["approved", "rejected"]), review_note: z.string().optional() }))
    .mutation(({ ctx, input }) => promotion_review_service.review({ ...input, reviewer_user_id: ctx.session!.user.id })),

  promotionListPendingReviews: permission_procedure(PERMISSIONS.promotions_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ input }) => promotion_review_service.list_pending(input.page, input.limit)),

  promotionGetReviews: permission_procedure(PERMISSIONS.promotions_read)
    .input(z.object({ promotion_id: z.string() }))
    .query(({ input }) => promotion_review_service.get_by_promotion(input.promotion_id)),

  promotionCountPendingReviews: permission_procedure(PERMISSIONS.promotions_read)
    .query(() => promotion_review_service.count_pending()),

  promotionListReviews: permission_procedure(PERMISSIONS.promotions_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional() }))
    .query(({ input }) => promotion_review_service.list_reviews(input.page, input.limit, input.status)),

  promotionGetReviewStats: permission_procedure(PERMISSIONS.promotions_read)
    .query(() => promotion_review_service.get_review_stats()),
});
