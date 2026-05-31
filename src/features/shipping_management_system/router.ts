import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { shipping_service } from "./services/shipping.service";

export const shipping_router = create_trpc_router({
  // Publicly calculate shipping quotes
  quote: public_procedure
    .input(
      z.object({
        provider: z.enum(["yalidine", "dhl", "fedex", "ups", "ems"]),
        to_city: z.string().min(1),
        country_code: z.string().length(2),
        weight_kg: z.number().positive(),
        is_cod: z.boolean(),
        cod_amount: z.number().optional(),
      }),
    )
    .query(({ input }) => shipping_service.quote(input)),

  // Public/storefront tracking by order number or ID
  trackingByOrder: public_procedure
    .input(z.object({ order_id: z.string().min(1) }))
    .query(({ input }) => shipping_service.tracking_by_order(input.order_id)),

  // Customer tracking page detail
  getDetail: storefront_procedure
    .input(z.object({ shipment_id: z.string().min(1) }))
    .query(({ input }) => shipping_service.get_shipment_detail(input.shipment_id)),

  // Admin and Operators listing all shipments
  adminList: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) =>
      shipping_service["repo"].list_shipments(input.page, input.limit, input.status),
    ),

  // Dispatchers/operators creating shipments for approved orders
  create: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string().min(1),
        provider: z.enum(["yalidine", "dhl", "fedex", "ups", "ems"]),
        weight_kg: z.number().positive(),
      }),
    )
    .mutation(({ input }) => shipping_service.create_for_order(input)),

  // Force tracking sync for a shipment
  sync: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ shipment_id: z.string().min(1) }))
    .mutation(({ input }) => shipping_service.sync_tracking(input.shipment_id)),
});
