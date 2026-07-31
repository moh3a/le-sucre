import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { favorites_service } from "../services/favorites.service";
import { add_favorite_dto, remove_favorite_dto, list_favorites_dto, check_favorite_dto } from "../models/favorites.dto";

export const favorites_router = create_trpc_router({
  list: storefront_procedure
    .input(list_favorites_dto)
    .query(({ ctx, input }) => favorites_service.list(ctx.user.id, input)),

  add: storefront_procedure
    .input(add_favorite_dto)
    .mutation(({ ctx, input }) => favorites_service.add(ctx.user.id, input)),

  remove: storefront_procedure
    .input(remove_favorite_dto)
    .mutation(({ ctx, input }) => favorites_service.remove(ctx.user.id, input.id)),

  check: storefront_procedure
    .input(check_favorite_dto)
    .query(({ ctx, input }) => favorites_service.check(ctx.user.id, input)),

  productCount: storefront_procedure
    .input(z.object({ product_id: z.string().min(1) }))
    .query(({ input }) => favorites_service.get_product_favorite_count(input.product_id)),
});
