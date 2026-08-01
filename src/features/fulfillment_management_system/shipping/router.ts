import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { shipping_service } from "./services/shipping.service";
import { shipping_repository } from "./repository";
import { shippingProviderNamesSchema } from "./types";

export const shipping_router = create_trpc_router({
  quote: public_procedure
    .input(
      z.object({
        provider: shippingProviderNamesSchema,
        to_city: z.string().min(1),
        country_code: z.string().length(2),
        weight_kg: z.number().positive(),
        is_cod: z.boolean(),
        cod_amount: z.number().optional(),
      }),
    )
    .query(({ input }) => shipping_service.quote(input)),

  trackingByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string().min(1) }))
    .query(({ input }) => shipping_service.tracking_by_order(input.order_id)),

  getDetail: storefront_procedure
    .input(z.object({ shipment_id: z.string().min(1) }))
    .query(({ input }) => shipping_service.get_shipment_detail(input.shipment_id)),

  adminGetDetail: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ shipment_id: z.string().min(1) }))
    .query(({ input }) => shipping_service.get_shipment_detail(input.shipment_id)),

  adminList: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) =>
      shipping_repository.admin_list_enriched(input.page, input.limit, input.status),
    ),

  adminStats: permission_procedure(PERMISSIONS.orders_read).query(() =>
    shipping_repository.admin_stats(),
  ),

  providerOverview: permission_procedure(PERMISSIONS.shipping_read)
    .input(
      z.object({
        provider: shippingProviderNamesSchema,
        page: z.number().int().min(1).default(1),
        page_size: z.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => shipping_service.provider_overview(input)),

  getLabel: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ shipment_id: z.string().min(1) }))
    .mutation(({ input }) => shipping_service.get_shipment_label(input.shipment_id)),

  create: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string().min(1),
        provider: shippingProviderNamesSchema,
        weight_kg: z.number().positive(),
      }),
    )
    .mutation(({ ctx, input }) =>
      shipping_service.create_for_order({ ...input, actor_user_id: ctx.session!.user.id }),
    ),

  sync: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ shipment_id: z.string().min(1) }))
    .mutation(({ input }) => shipping_service.sync_tracking(input.shipment_id)),
});
