import { z } from "zod";

import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { cart_service } from "./cart.service";
import { get_storefront_identity } from "./cart-context.helper";
import { CART_ERROR } from "./constants/error-codes";
import { add_cart_item_dto, update_cart_item_dto } from "./models/cart.dto";

export const cart_router = create_trpc_router({
  getCart: public_procedure
    .input(
      z.object({
        cart_id: z.string().max(255).optional(),
        locale: z.string().default("fr"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const identity = await get_storefront_identity(ctx.req.headers);
      const cart_id = input.cart_id || identity.cart_id;
      if (!cart_id) throw_error(CART_ERROR.NOT_FOUND);
      return cart_service.get_cart_view(cart_id, input.locale);
    }),

  adminList: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(({ input }) => cart_service.list_admin(input)),

  adminStats: permission_procedure(PERMISSIONS.orders_read)
    .query(() => cart_service.stats_admin()),

  adminGetById: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ cart_id: z.string().min(1).max(255), locale: z.string().default("fr") }))
    .query(({ input }) => cart_service.get_cart_view(input.cart_id, input.locale)),

  addItem: public_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255) }).merge(add_cart_item_dto))
    .mutation(async ({ input, ctx }) => {
      const identity = await get_storefront_identity(ctx.req.headers);
      await cart_service.assert_cart_owned(input.cart_id, {
        user_id: identity.user_id,
        cookie_cart_id: identity.cart_id,
      });
      return cart_service.add_item(input.cart_id, {
        sku_id: input.sku_id,
        quantity: input.quantity,
      });
    }),

  addProduct: public_procedure
    .input(
      z.object({
        cart_id: z.string().min(1).max(255),
        product_id: z.string().min(1).max(255),
        quantity: z.number().int().min(1).max(99).default(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const identity = await get_storefront_identity(ctx.req.headers);
      await cart_service.assert_cart_owned(input.cart_id, {
        user_id: identity.user_id,
        cookie_cart_id: identity.cart_id,
      });
      return cart_service.add_product(input.cart_id, input.product_id, input.quantity);
    }),

  updateItem: public_procedure
    .input(
      z
        .object({
          cart_id: z.string().min(1).max(255),
          item_id: z.string().min(1).max(255),
        })
        .merge(update_cart_item_dto),
    )
    .mutation(async ({ input, ctx }) => {
      const identity = await get_storefront_identity(ctx.req.headers);
      await cart_service.assert_cart_owned(input.cart_id, {
        user_id: identity.user_id,
        cookie_cart_id: identity.cart_id,
      });
      return cart_service.update_quantity(input.cart_id, input.item_id, {
        quantity: input.quantity,
      });
    }),

  removeItem: public_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255), item_id: z.string().min(1).max(255) }))
    .mutation(async ({ input, ctx }) => {
      const identity = await get_storefront_identity(ctx.req.headers);
      await cart_service.assert_cart_owned(input.cart_id, {
        user_id: identity.user_id,
        cookie_cart_id: identity.cart_id,
      });
      return cart_service.remove_item(input.cart_id, input.item_id);
    }),

  mergeGuestCart: public_procedure.mutation(async ({ ctx }) => {
    const identity = await get_storefront_identity(ctx.req.headers);
    if (!identity.user_id) throw_error(CART_ERROR.NOT_FOUND);
    if (!identity.cart_id) return { merged: false as const };
    const cart_id = await cart_service.merge_guest_into_user(identity.cart_id, identity.user_id);
    return { merged: true as const, cart_id };
  }),

  adminAddItem: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ cart_id: z.string().min(1).max(255) }).merge(add_cart_item_dto))
    .mutation(({ input }) =>
      cart_service.add_item(input.cart_id, {
        sku_id: input.sku_id,
        quantity: input.quantity,
      }),
    ),

  adminRemoveItem: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ cart_id: z.string().min(1).max(255), item_id: z.string().min(1).max(255) }))
    .mutation(({ input }) => cart_service.admin_remove_item(input.cart_id, input.item_id)),

  adminClearCart: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ cart_id: z.string().min(1).max(255) }))
    .mutation(({ input }) => cart_service.admin_clear_cart(input.cart_id)),

  adminDeleteCart: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ cart_id: z.string().min(1).max(255) }))
    .mutation(({ input }) => cart_service.admin_delete_cart(input.cart_id)),
});
