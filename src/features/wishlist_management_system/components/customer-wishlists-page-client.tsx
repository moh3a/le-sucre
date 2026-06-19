"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { WishlistPanel } from "./wishlist-panel";

export function CustomerWishlistsPageClient() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data: wishlists, isLoading: wlLoading } = trpc.wishlistManagement.wishlists.list.useQuery({ page: 1, limit: 50 });
  const { data: stats } = trpc.wishlistManagement.wishlists.stats.useQuery();
  const { data: items, isLoading: itemsLoading } = trpc.wishlistManagement.wishlists.listItems.useQuery(
    { wishlist_id: selectedId ?? "", page: 1, limit: 100 },
    { enabled: !!selectedId },
  );
  const { data: allItems } = trpc.wishlistManagement.wishlists.listItems.useQuery(
    { wishlist_id: wishlists?.items?.[0]?.id ?? "", page: 1, limit: 100 },
    { enabled: !selectedId && (wishlists?.items?.length ?? 0) > 0 },
  );
  const createWishlistMut = trpc.wishlistManagement.wishlists.create.useMutation();
  const deleteWishlistMut = trpc.wishlistManagement.wishlists.delete.useMutation();
  const removeItemMut = trpc.wishlistManagement.wishlists.removeItem.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!selectedId && wishlists?.items?.length) {
      setSelectedId(wishlists.items[0].id);
    }
  }, [wishlists, selectedId]);

  async function handleCreate(name: string) {
    await createWishlistMut.mutateAsync({ name, is_public: false, is_private: true });
    utils.wishlistManagement.wishlists.list.invalidate();
    utils.wishlistManagement.wishlists.stats.invalidate();
  }

  async function handleDelete(id: string) {
    await deleteWishlistMut.mutateAsync({ id });
    utils.wishlistManagement.wishlists.list.invalidate();
    utils.wishlistManagement.wishlists.stats.invalidate();
    if (selectedId === id) setSelectedId(undefined);
  }

  async function handleRemoveItem(itemId: string) {
    await removeItemMut.mutateAsync({ id: itemId });
    utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: selectedId ?? "" });
    utils.wishlistManagement.wishlists.stats.invalidate();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Mes listes de souhaits</h1>
      <WishlistPanel
        wishlists={wishlists?.items ?? []}
        items={selectedId ? items?.items : (allItems?.items ?? [])}
        stats={stats ?? { total_wishlists: 0, total_items: 0, total_purchased: 0, conversion_rate: 0 }}
        selectedWishlistId={selectedId}
        onSelectWishlist={setSelectedId}
        onCreateWishlist={handleCreate}
        onDeleteWishlist={handleDelete}
        onRemoveItem={handleRemoveItem}
        isLoading={wlLoading || itemsLoading}
      />
    </div>
  );
}
