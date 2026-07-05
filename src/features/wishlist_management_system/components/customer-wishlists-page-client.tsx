"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { WishlistPanel } from "./wishlist-panel";
import { WishlistsPageSkeleton } from "./wishlists-page-skeleton";

export function CustomerWishlistsPageClient() {
  const t = useTranslations("wishlist");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const listQuery = trpc.wishlistManagement.wishlists.list.useQuery({ page: 1, limit: 50 });
  const statsQuery = trpc.wishlistManagement.wishlists.stats.useQuery();
  const itemsQuery = trpc.wishlistManagement.wishlists.listItems.useQuery(
    { wishlist_id: selectedId ?? "", page: 1, limit: 100 },
    { enabled: !!selectedId },
  );
  const allItemsQuery = trpc.wishlistManagement.wishlists.listItems.useQuery(
    { wishlist_id: listQuery.data?.items?.[0]?.id ?? "", page: 1, limit: 100 },
    { enabled: !selectedId && (listQuery.data?.items?.length ?? 0) > 0 },
  );
  const createWishlistMut = trpc.wishlistManagement.wishlists.create.useMutation();
  const deleteWishlistMut = trpc.wishlistManagement.wishlists.delete.useMutation();
  const removeItemMut = trpc.wishlistManagement.wishlists.removeItem.useMutation();
  const utils = trpc.useUtils();

  const queryError = useMemo(() => {
    return listQuery.error ?? statsQuery.error ?? itemsQuery.error ?? allItemsQuery.error ?? null;
  }, [listQuery.error, statsQuery.error, itemsQuery.error, allItemsQuery.error]);

  const wishes = useMemo(() => listQuery.data?.items ?? [], [listQuery.data?.items]);
  const isItemsLoading = itemsQuery.isLoading || allItemsQuery.isLoading;

  useEffect(() => {
    if (!selectedId && wishes.length) {
      setSelectedId(wishes[0].id);
    }
  }, [wishes, selectedId]);

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
    <QueryGuard
      query={{ isLoading: listQuery.isLoading, error: queryError }}
      loadingFallback={<WishlistsPageSkeleton />}
    >
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">{t("my_lists")}</h1>
        <WishlistPanel
          wishlists={wishes}
          items={selectedId ? itemsQuery.data?.items : (allItemsQuery.data?.items ?? [])}
          stats={
            statsQuery.data ?? {
              total_wishlists: 0,
              total_items: 0,
              total_purchased: 0,
              conversion_rate: 0,
            }
          }
          selectedWishlistId={selectedId}
          onSelectWishlist={setSelectedId}
          onCreateWishlist={handleCreate}
          onDeleteWishlist={handleDelete}
          onRemoveItem={handleRemoveItem}
          isLoading={listQuery.isLoading || isItemsLoading}
        />
      </div>
    </QueryGuard>
  );
}
