import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import {
  create_review_dto,
  list_product_reviews_dto,
  moderate_review_dto,
  admin_list_reviews_dto,
  helpful_vote_dto,
  report_review_dto,
} from "./models/review.dto";
import { getClientIp } from "@/lib/rate-limit";
import { review_service } from "./services/review.service";
import { moderation_service } from "./services/moderation.service";
import { helpful_service } from "./services/helpful.service";
import { report_service } from "./services/report.service";

export const reviews_router = create_trpc_router({
  summaryByProduct: public_procedure
    .input(z.object({ product_id: z.string().min(1).max(255) }))
    .query(({ input }) => review_service.get_product_summary(input.product_id)),

  listByProduct: public_procedure
    .input(list_product_reviews_dto)
    .query(({ input }) => review_service.list_product_reviews(input)),

  create: storefront_procedure
    .input(create_review_dto)
    .mutation(({ ctx, input }) =>
      review_service.create_review(ctx.session!.user.id, input, getClientIp(ctx.req.headers)),
    ),

  myReviews: storefront_procedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(({ ctx, input }) =>
      review_service.list_my_reviews(ctx.session!.user.id, input.page, input.limit),
    ),

  voteHelpful: storefront_procedure
    .input(helpful_vote_dto)
    .mutation(({ ctx, input }) => helpful_service.vote(ctx.session!.user.id, input.review_id)),

  report: storefront_procedure
    .input(report_review_dto)
    .mutation(({ ctx, input }) => report_service.report(ctx.session!.user.id, input)),

  adminList: permission_procedure(PERMISSIONS.reviews_read)
    .input(admin_list_reviews_dto)
    .query(({ input }) => moderation_service.admin_list(input)),

  moderate: permission_procedure(PERMISSIONS.products_write)
    .input(moderate_review_dto)
    .mutation(({ ctx, input }) => moderation_service.moderate(ctx.session!.user.id, input)),

  adminStats: permission_procedure(PERMISSIONS.reviews_read).query(() =>
    moderation_service.stats(),
  ),
  ratingTrends: permission_procedure(PERMISSIONS.reviews_read)
    .input(z.object({ days: z.number().default(30) }))
    .query(({ input }) => moderation_service.rating_trends(input.days)),
});
