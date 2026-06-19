import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { storefront_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { sharing_service } from "../services/sharing.service";
import {
  create_share_link_dto,
  revoke_share_link_dto,
  list_share_links_dto,
  get_shared_wishlist_dto,
} from "../models/share.dto";

export const sharing_router = create_trpc_router({
  createLink: storefront_procedure
    .input(create_share_link_dto)
    .mutation(({ ctx, input }) => sharing_service.create_share_link(ctx.user.id, input)),

  revokeLink: storefront_procedure
    .input(revoke_share_link_dto)
    .mutation(({ ctx, input }) => sharing_service.revoke_share_link(ctx.user.id, input.token_id)),

  listLinks: storefront_procedure
    .input(list_share_links_dto)
    .query(({ ctx, input }) => sharing_service.list_share_links(ctx.user.id, input)),

  getShared: public_procedure
    .input(get_shared_wishlist_dto)
    .query(({ input }) => sharing_service.get_shared_wishlist(input.token)),
});
