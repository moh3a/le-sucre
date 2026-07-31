export const AUDIT_ACTION = {
  WISHLIST_CREATED: "wishlist.created",
  WISHLIST_UPDATED: "wishlist.updated",
  WISHLIST_DELETED: "wishlist.deleted",
  WISHLIST_ITEM_ADDED: "wishlist.item.added",
  WISHLIST_ITEM_REMOVED: "wishlist.item.removed",
  SAVE_FOR_LATER_ADDED: "save_for_later.added",
  SAVE_FOR_LATER_MOVED_TO_CART: "save_for_later.moved_to_cart",
  FAVORITE_ADDED: "favorite.added",
  COLLECTION_CREATED: "collection.created",
} as const;

export type WishlistAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
