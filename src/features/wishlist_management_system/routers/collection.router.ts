import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { collection_service } from "../services/collection.service";
import {
  create_collection_dto,
  update_collection_dto,
  list_collections_dto,
  add_collection_item_dto,
  remove_collection_item_dto,
  list_collection_items_dto,
} from "../models/collection.dto";
import { z } from "zod";

export const collection_router = create_trpc_router({
  list: storefront_procedure
    .input(list_collections_dto)
    .query(({ ctx, input }) => collection_service.list(ctx.user.id, input)),

  listPublic: public_procedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(({ input }) => collection_service.list_public(input.page, input.limit)),

  byId: storefront_procedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => collection_service.get_by_id(input.id, ctx.user.id)),

  create: storefront_procedure
    .input(create_collection_dto)
    .mutation(({ ctx, input }) => collection_service.create(ctx.user.id, input)),

  update: storefront_procedure
    .input(update_collection_dto)
    .mutation(({ ctx, input }) => collection_service.update(ctx.user.id, input)),

  delete: storefront_procedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => collection_service.delete(ctx.user.id, input.id)),

  addItem: storefront_procedure
    .input(add_collection_item_dto)
    .mutation(({ ctx, input }) => collection_service.add_item(ctx.user.id, input)),

  removeItem: storefront_procedure
    .input(remove_collection_item_dto)
    .mutation(({ ctx, input }) => collection_service.remove_item(ctx.user.id, input.collection_id, input.item_id)),

  listItems: storefront_procedure
    .input(list_collection_items_dto)
    .query(({ ctx, input }) => collection_service.list_items(ctx.user.id, input)),
});
