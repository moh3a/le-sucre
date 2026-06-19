import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { save_for_later_service } from "../services/save_for_later.service";
import {
  save_for_later_dto,
  move_to_cart_dto,
  remove_saved_item_dto,
  list_saved_items_dto,
} from "../models/save_for_later.dto";

export const save_for_later_router = create_trpc_router({
  list: storefront_procedure
    .input(list_saved_items_dto)
    .query(({ ctx, input }) => save_for_later_service.list(ctx.user.id, input)),

  save: storefront_procedure
    .input(save_for_later_dto)
    .mutation(({ ctx, input }) => save_for_later_service.save(ctx.user.id, input)),

  moveToCart: storefront_procedure
    .input(move_to_cart_dto)
    .mutation(({ ctx, input }) => save_for_later_service.move_to_cart(ctx.user.id, input)),

  remove: storefront_procedure
    .input(remove_saved_item_dto)
    .mutation(({ ctx, input }) => save_for_later_service.remove(ctx.user.id, input.id)),
});
