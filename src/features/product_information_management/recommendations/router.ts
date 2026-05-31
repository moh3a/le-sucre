// router.ts
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import {
  product_recommendations_query_dto,
  trending_query_dto,
  for_you_query_dto,
  recent_query_dto,
  track_product_view_dto,
  recommendation_analytics_event_dto,
} from "./models/recommendation.dto";
import { recommendation_service } from "./services/recommendation.service";
import { view_tracking_service } from "./services/view-tracking.service";
import { track_recommendation_event } from "./analytics/recommendation-analytics.hook";
import { product_service } from "@/features/product_information_management/products/services/product.service";

export const recommendations_router = create_trpc_router({
  byProduct: public_procedure.input(product_recommendations_query_dto).query(async ({ input }) => {
    const product_id =
      input.product_id ??
      (input.slug
        ? (await product_service.get_by_slug(input.slug, input.locale)).product.id
        : null);
    if (!product_id) throw new Error("product_required");
    return recommendation_service.get_product_recommendations({
      product_id,
      locale: input.locale,
      types: input.types,
      limit: input.limit,
    });
  }),

  trending: public_procedure
    .input(trending_query_dto)
    .query(({ input }) =>
      recommendation_service.get_trending(input.locale, input.period, input.limit),
    ),

  forYou: storefront_procedure
    .input(for_you_query_dto)
    .query(({ ctx, input }) =>
      recommendation_service.get_for_you(ctx.session!.user.id, input.locale, input.limit),
    ),

  recent: public_procedure.input(recent_query_dto).query(async ({ input, ctx }) => {
    const ids = await view_tracking_service.list_recent({
      user_id: ctx.session?.user?.id,
      session_key: input.session_key,
      limit: input.limit,
    });
    return recommendation_service.hydrate_ids(input.locale, ids);
  }),

  trackView: public_procedure.input(track_product_view_dto).mutation(({ input, ctx }) =>
    view_tracking_service.track_view({
      product_id: input.product_id,
      user_id: ctx.session?.user?.id,
      session_key: input.session_key,
    }),
  ),

  trackAnalytics: public_procedure
    .input(recommendation_analytics_event_dto)
    .mutation(({ input, ctx }) =>
      track_recommendation_event({
        ...input,
        user_id: ctx.session?.user?.id,
        session_key: input.session_key,
      }),
    ),
});
