import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { cart_service } from "./cart.service";
import { add_cart_item_dto, update_cart_item_dto } from "./models/cart.dto";

export const cart_router = create_trpc_router({
  byId: storefront_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255), locale: z.string().default("fr") }))
    .query(({ input }) => cart_service.get_cart_view(input.cart_id, input.locale)),

  addItem: storefront_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255) }).merge(add_cart_item_dto))
    .mutation(({ input }) =>
      cart_service.add_item(input.cart_id, {
        sku_id: input.sku_id,
        quantity: input.quantity,
      }),
    ),

  updateItem: storefront_procedure
    .input(
      z
        .object({
          cart_id: z.string().min(1).max(255),
          item_id: z.string().min(1).max(255),
        })
        .merge(update_cart_item_dto),
    )
    .mutation(({ input }) =>
      cart_service.update_quantity(input.cart_id, input.item_id, { quantity: input.quantity }),
    ),

  removeItem: storefront_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255), item_id: z.string().min(1).max(255) }))
    .mutation(({ input }) => cart_service.remove_item(input.cart_id, input.item_id)),
});
