import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { checkout_service } from "./checkout.service";
import { checkout_preview_dto, place_order_dto } from "../orders/models/order.dto";

export const checkout_router = create_trpc_router({
  preview: storefront_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255) }).merge(checkout_preview_dto))
    .query(({ input, ctx }) =>
      checkout_service.preview({
        ...input,
        user_id: ctx.session?.user?.id ?? null,
      }),
    ),

  place: storefront_procedure
    .input(z.object({ cart_id: z.string().min(1).max(255) }).merge(place_order_dto))
    .mutation(({ input, ctx }) =>
      checkout_service.place({
        ...input,
        user_id: ctx.session?.user?.id ?? null,
      }),
    ),
});
