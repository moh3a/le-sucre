import { create_trpc_router } from "@/lib/trpc/router";
import { wishlist_router } from "./routers/wishlist.router";
import { shared_wishlist_router } from "./routers/wishlist.router";
import { collection_router } from "./routers/collection.router";
import { favorites_router } from "./routers/favorites.router";
import { save_for_later_router } from "./routers/save_for_later.router";
import { sharing_router } from "./routers/sharing.router";
import { wishlist_admin_router } from "./routers/wishlist-admin.router";

export const wishlist_management_router = create_trpc_router({
  wishlists: wishlist_router,
  sharedWishlists: shared_wishlist_router,
  collections: collection_router,
  favorites: favorites_router,
  saveForLater: save_for_later_router,
  sharing: sharing_router,
  admin: wishlist_admin_router,
});
