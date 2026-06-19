import { z } from "zod";

export const create_share_link_dto = z.object({
  wishlist_id: z.string().min(1),
  permission: z.enum(["read", "collaborate"]).default("read"),
  expires_in_days: z.number().int().min(1).max(365).optional(),
  max_uses: z.number().int().min(0).default(0),
});

export const revoke_share_link_dto = z.object({
  token_id: z.string().min(1),
});

export const get_shared_wishlist_dto = z.object({
  token: z.string().min(1),
});

export const list_share_links_dto = z.object({
  wishlist_id: z.string().min(1),
});
