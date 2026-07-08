"use client";

import { useCallback } from "react";
import { trpc } from "@/components/providers/app-providers";

export function useWishlist(wishlistId?: string) {
  const utils = trpc.useUtils();

  const createWishlist = trpc.wishlistManagement.wishlists.create.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.wishlists.list.invalidate();
    },
  });

  const updateWishlist = trpc.wishlistManagement.wishlists.update.useMutation({
    onSuccess: (_data, vars) => {
      utils.wishlistManagement.wishlists.byId.invalidate({ id: vars.id });
      utils.wishlistManagement.wishlists.list.invalidate();
    },
  });

  const deleteWishlist = trpc.wishlistManagement.wishlists.delete.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.wishlists.list.invalidate();
    },
  });

  const addItem = trpc.wishlistManagement.wishlists.addItem.useMutation({
    onSuccess: () => {
      if (wishlistId) utils.wishlistManagement.wishlists.byId.invalidate({ id: wishlistId });
    },
  });

  const removeItem = trpc.wishlistManagement.wishlists.removeItem.useMutation({
    onSuccess: () => {
      if (wishlistId) utils.wishlistManagement.wishlists.byId.invalidate({ id: wishlistId });
    },
  });

  const moveItem = trpc.wishlistManagement.wishlists.moveItem.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.wishlists.list.invalidate();
    },
  });

  return {
    createWishlist: useCallback(
      (data: { name: string; description?: string | null; is_public?: boolean }) =>
        createWishlist.mutateAsync(data),
      [createWishlist],
    ),
    updateWishlist: useCallback(
      (data: { id: string; name?: string; description?: string | null; is_public?: boolean }) =>
        updateWishlist.mutateAsync(data),
      [updateWishlist],
    ),
    deleteWishlist: useCallback((id: string) => deleteWishlist.mutateAsync({ id }), [deleteWishlist]),
    addItem: useCallback(
      (data: { wishlist_id: string; product_id: string; variant_id?: string | null; quantity?: number; priority?: "low" | "medium" | "high" | "urgent" }) =>
        addItem.mutateAsync(data),
      [addItem],
    ),
    removeItem: useCallback((id: string) => removeItem.mutateAsync({ id }), [removeItem]),
    moveItem: useCallback(
      (data: { item_id: string; from_wishlist_id: string; to_wishlist_id: string }) =>
        moveItem.mutateAsync(data),
      [moveItem],
    ),
    isPending: createWishlist.isPending || updateWishlist.isPending || deleteWishlist.isPending,
  };
}

export function useFavorites() {
  const utils = trpc.useUtils();

  const addFavorite = trpc.wishlistManagement.favorites.add.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.favorites.list.invalidate();
    },
  });

  const removeFavorite = trpc.wishlistManagement.favorites.remove.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.favorites.list.invalidate();
    },
  });

  return {
    addFavorite: useCallback(
      (data: { product_id?: string; brand_id?: string; category_id?: string }) =>
        addFavorite.mutateAsync(data),
      [addFavorite],
    ),
    removeFavorite: useCallback((id: string) => removeFavorite.mutateAsync({ id }), [removeFavorite]),
    checkFavorite: trpc.wishlistManagement.favorites.check.useQuery,
    productCount: trpc.wishlistManagement.favorites.productCount.useQuery,
  };
}

export function useSaveForLater() {
  const utils = trpc.useUtils();

  const save = trpc.wishlistManagement.saveForLater.save.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.saveForLater.list.invalidate();
    },
  });

  const moveToCart = trpc.wishlistManagement.saveForLater.moveToCart.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.saveForLater.list.invalidate();
    },
  });

  const remove = trpc.wishlistManagement.saveForLater.remove.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.saveForLater.list.invalidate();
    },
  });

  return {
    save: useCallback(
      (data: { product_id: string; variant_id?: string | null; quantity?: number; original_cart_item_id?: string | null }) =>
        save.mutateAsync(data),
      [save],
    ),
    moveToCart: useCallback((data: { id: string; quantity?: number }) => moveToCart.mutateAsync(data), [moveToCart]),
    removeSaved: useCallback((id: string) => remove.mutateAsync({ id }), [remove]),
  };
}

export function useCollections() {
  const utils = trpc.useUtils();

  const create = trpc.wishlistManagement.collections.create.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.collections.list.invalidate();
    },
  });

  const updateCol = trpc.wishlistManagement.collections.update.useMutation({
    onSuccess: (_data, vars) => {
      if ("id" in vars) utils.wishlistManagement.collections.byId.invalidate({ id: (vars as { id: string }).id });
      utils.wishlistManagement.collections.list.invalidate();
    },
  });

  const deleteCol = trpc.wishlistManagement.collections.delete.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.collections.list.invalidate();
    },
  });

  const addItem = trpc.wishlistManagement.collections.addItem.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.collections.listItems.invalidate();
    },
  });

  const removeItem = trpc.wishlistManagement.collections.removeItem.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.collections.listItems.invalidate();
    },
  });

  return {
    create: useCallback(
      (data: { name: string; description?: string | null; is_public?: boolean }) =>
        create.mutateAsync(data),
      [create],
    ),
    update: useCallback(
      (data: { id: string; name?: string; description?: string | null; is_public?: boolean }) =>
        updateCol.mutateAsync(data),
      [updateCol],
    ),
    delete: useCallback((id: string) => deleteCol.mutateAsync({ id }), [deleteCol]),
    addItem: useCallback(
      (data: { collection_id: string; product_id: string; variant_id?: string | null }) =>
        addItem.mutateAsync(data),
      [addItem],
    ),
    removeItem: useCallback(
      (data: { collection_id: string; item_id: string }) => removeItem.mutateAsync(data),
      [removeItem],
    ),
  };
}

export function useWishlistSharing() {
  const utils = trpc.useUtils();

  const createLink = trpc.wishlistManagement.sharing.createLink.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.sharing.listLinks.invalidate();
    },
  });

  const revokeLink = trpc.wishlistManagement.sharing.revokeLink.useMutation({
    onSuccess: () => {
      utils.wishlistManagement.sharing.listLinks.invalidate();
    },
  });

  return {
    createLink: useCallback(
      (data: Parameters<(typeof createLink)['mutateAsync']>[0]) =>
        createLink.mutateAsync(data),
      [createLink],
    ),
    revokeLink: useCallback((token_id: string) => revokeLink.mutateAsync({ token_id }), [revokeLink]),
  };
}
