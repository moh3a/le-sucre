import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { wishlist_service } from "../services/wishlist.service";
import {
  create_wishlist_dto,
  update_wishlist_dto,
  list_wishlists_dto,
  get_wishlist_by_id_dto,
  delete_wishlist_dto,
  set_default_wishlist_dto,
} from "../models/wishlist.dto";
import {
  add_wishlist_item_dto,
  update_wishlist_item_dto,
  remove_wishlist_item_dto,
  move_wishlist_item_dto,
  bulk_add_wishlist_items_dto,
  list_wishlist_items_dto,
  reorder_wishlist_items_dto,
} from "../models/wishlist_item.dto";
import { sharing_service } from "../services/sharing.service";

export const wishlist_router = create_trpc_router({
  list: storefront_procedure
    .input(list_wishlists_dto)
    .query(({ ctx, input }) => wishlist_service.list(ctx.user.id, input)),

  byId: storefront_procedure
    .input(get_wishlist_by_id_dto)
    .query(({ ctx, input }) => wishlist_service.get_by_id(input.id, ctx.user.id)),

  create: storefront_procedure
    .input(create_wishlist_dto)
    .mutation(({ ctx, input }) => wishlist_service.create(ctx.user.id, input)),

  update: storefront_procedure
    .input(update_wishlist_dto)
    .mutation(({ ctx, input }) => wishlist_service.update(ctx.user.id, input)),

  delete: storefront_procedure
    .input(delete_wishlist_dto)
    .mutation(({ ctx, input }) => wishlist_service.delete(ctx.user.id, input.id)),

  setDefault: storefront_procedure
    .input(set_default_wishlist_dto)
    .mutation(({ ctx, input }) => wishlist_service.set_default(ctx.user.id, input.id)),

  addItem: storefront_procedure
    .input(add_wishlist_item_dto)
    .mutation(({ ctx, input }) => wishlist_service.add_item(ctx.user.id, input)),

  updateItem: storefront_procedure
    .input(update_wishlist_item_dto)
    .mutation(({ ctx, input }) => wishlist_service.update_item(ctx.user.id, input)),

  removeItem: storefront_procedure
    .input(remove_wishlist_item_dto)
    .mutation(({ ctx, input }) => wishlist_service.remove_item(ctx.user.id, input.id)),

  moveItem: storefront_procedure
    .input(move_wishlist_item_dto)
    .mutation(({ ctx, input }) => wishlist_service.move_item(ctx.user.id, input)),

  bulkAdd: storefront_procedure
    .input(bulk_add_wishlist_items_dto)
    .mutation(({ ctx, input }) => wishlist_service.bulk_add(ctx.user.id, input)),

  listItems: storefront_procedure
    .input(list_wishlist_items_dto)
    .query(({ ctx, input }) => wishlist_service.list_items(ctx.user.id, input)),

  reorderItems: storefront_procedure
    .input(reorder_wishlist_items_dto)
    .mutation(async ({ ctx, input }) => {
      for (let i = 0; i < input.item_ids.length; i++) {
        await wishlist_service.update_item(ctx.user.id, { id: input.item_ids[i], sort_order: i });
      }
    }),

  stats: storefront_procedure
    .query(({ ctx }) => wishlist_service.get_stats(ctx.user.id)),

  publicWishlists: storefront_procedure
    .query(({ ctx }) => wishlist_service.get_public_wishlist(ctx.user.id)),
});

export const shared_wishlist_router = create_trpc_router({
  getByToken: public_procedure
    .input(z.object({ token: z.string().min(1) }))
    .query(({ input }) => sharing_service.get_shared_wishlist(input.token)),
});
