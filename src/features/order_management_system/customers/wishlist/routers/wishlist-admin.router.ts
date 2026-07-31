import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { wishlist_analytics_service } from "../services/wishlist-analytics.service";
import { favorites_service } from "../services/favorites.service";
import { wishlist_analytics_query_dto, wishlist_analytics_export_dto } from "../models/analytics.dto";

export const wishlist_admin_router = create_trpc_router({
  summary: permission_procedure(PERMISSIONS.analytics_read)
    .input(wishlist_analytics_query_dto)
    .query(({ input }) => wishlist_analytics_service.get_summary(input)),

  trendingProducts: permission_procedure(PERMISSIONS.analytics_read)
    .input(z.object({ limit: z.number().default(20), period: z.number().default(7) }))
    .query(({ input }) => wishlist_analytics_service.get_trending_wishlist_products(input.limit, input.period)),

  abandonedProducts: permission_procedure(PERMISSIONS.analytics_read)
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ input }) => wishlist_analytics_service.get_abandoned_products(input.limit)),

  highConvertingProducts: permission_procedure(PERMISSIONS.analytics_read)
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ input }) => wishlist_analytics_service.get_high_converting_products(input.limit)),

  topFavorited: permission_procedure(PERMISSIONS.analytics_read)
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ input }) => favorites_service.get_top_favorited(input.limit)),

  topWishedProducts: permission_procedure(PERMISSIONS.analytics_read)
    .input(wishlist_analytics_query_dto)
    .query(async ({ input }) => {
      const summary = await wishlist_analytics_service.get_summary(input);
      return summary.most_wished_products;
    }),

  exportAnalytics: permission_procedure(PERMISSIONS.analytics_read)
    .input(wishlist_analytics_export_dto)
    .query(async ({ input }) => {
      const data = await wishlist_analytics_service.get_summary(input);
      if (input.format === "csv") {
        const headers = "metric,value\n";
        const rows = [
          `total_wishlists,${data.total_wishlists}`,
          `active_wishlists,${data.active_wishlists}`,
          `total_saved_products,${data.total_saved_products}`,
          `conversion_rate,${data.wishlist_conversion_rate}`,
          `revenue_from_wishlists,${data.revenue_from_wishlists}`,
        ];
        return { csv: headers + rows.join("\n"), format: "csv" };
      }
      return { data, format: "json" };
    }),

  invalidateCache: permission_procedure(PERMISSIONS.analytics_read)
    .mutation(() => wishlist_analytics_service.invalidate_cache()),
});
