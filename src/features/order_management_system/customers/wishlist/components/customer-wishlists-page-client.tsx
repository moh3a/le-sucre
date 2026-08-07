"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { WishlistPanel } from "./wishlist-panel";
import { WishlistsPageSkeleton } from "./wishlists-page-skeleton";

export function CustomerWishlistsPageClient() {
  const t = useTranslations("wishlist");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const listQuery = trpc.wishlistManagement.wishlists.list.useQuery({ page: 1, limit: 50 });
  const statsQuery = trpc.wishlistManagement.wishlists.stats.useQuery();

  const wishes = useMemo(() => listQuery.data?.items ?? [], [listQuery.data?.items]);
  const resolvedSelectedId = selectedId ?? wishes[0]?.id;

  const itemsQuery = trpc.wishlistManagement.wishlists.listItems.useQuery(
    { wishlist_id: resolvedSelectedId ?? "", page: 1, limit: 100 },
    { enabled: !!resolvedSelectedId },
  );
  const createWishlistMut = trpc.wishlistManagement.wishlists.create.useMutation();
  const deleteWishlistMut = trpc.wishlistManagement.wishlists.delete.useMutation();
  const removeItemMut = trpc.wishlistManagement.wishlists.removeItem.useMutation();
  const setDefaultMut = trpc.wishlistManagement.wishlists.setDefault.useMutation();
  const updateItemMut = trpc.wishlistManagement.wishlists.updateItem.useMutation();
  const bulkAddMut = trpc.wishlistManagement.wishlists.bulkAdd.useMutation();
  const utils = trpc.useUtils();

  const queryError = useMemo(() => {
    return listQuery.error ?? statsQuery.error ?? itemsQuery.error ?? null;
  }, [listQuery.error, statsQuery.error, itemsQuery.error]);

  const isItemsLoading = itemsQuery.isLoading;

  async function handleCreate(name: string) {
    try {
      await createWishlistMut.mutateAsync({ name, is_public: false, is_private: true });
      toast.success(t("wishlist_created"));
      utils.wishlistManagement.wishlists.list.invalidate();
      utils.wishlistManagement.wishlists.stats.invalidate();
    } catch {
      toast.error(t("wishlist_created"));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWishlistMut.mutateAsync({ id });
      toast.success(t("wishlist_deleted"));
      utils.wishlistManagement.wishlists.list.invalidate();
      utils.wishlistManagement.wishlists.stats.invalidate();
      if (selectedId === id) setSelectedId(undefined);
    } catch {
      toast.error(t("wishlist_deleted"));
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await removeItemMut.mutateAsync({ id: itemId });
      toast.success(t("item_removed"));
      utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: selectedId ?? "" });
      utils.wishlistManagement.wishlists.stats.invalidate();
    } catch {
      toast.error(t("item_removed"));
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefaultMut.mutateAsync({ id });
      toast.success(t("set_default_success"));
      utils.wishlistManagement.wishlists.list.invalidate();
    } catch {
      toast.error(t("set_default_error"));
    }
  }

  async function handleUpdateItem(
    itemId: string,
    patch: {
      quantity?: number;
      priority?: "low" | "medium" | "high" | "urgent";
      notes?: string;
    },
  ) {
    try {
      await updateItemMut.mutateAsync({ id: itemId, ...patch });
      toast.success(t("item_updated"));
      utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: selectedId ?? "" });
    } catch {
      toast.error(t("item_updated"));
    }
  }

  async function handleBulkAdd(wishlistId: string, productIds: string[]) {
    try {
      await bulkAddMut.mutateAsync({
        wishlist_id: wishlistId,
        items: productIds.map((product_id) => ({ product_id })),
      });
      toast.success(t("items_added", { count: productIds.length }));
      utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: wishlistId });
      utils.wishlistManagement.wishlists.stats.invalidate();
    } catch {
      toast.error(t("items_added_error"));
    }
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
          items={itemsQuery.data?.items ?? []}
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
          onSetDefault={handleSetDefault}
          onUpdateItem={handleUpdateItem}
          onBulkAdd={handleBulkAdd}
          isLoading={listQuery.isLoading || isItemsLoading}
        />
      </div>
    </QueryGuard>
  );
}
