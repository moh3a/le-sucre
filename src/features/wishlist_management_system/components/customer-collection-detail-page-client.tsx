"use client";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function CustomerCollectionDetailPageClient({ collectionId }: { collectionId: string }) {
  const t = useTranslations("wishlist");
  const { data: collection, isLoading } = trpc.wishlistManagement.collections.byId.useQuery({ id: collectionId });
  const { data: itemsData } = trpc.wishlistManagement.collections.listItems.useQuery(
    { collection_id: collectionId, page: 1, limit: 100 },
  );
  const removeItemMut = trpc.wishlistManagement.collections.removeItem.useMutation();
  const utils = trpc.useUtils();

  async function handleRemove(itemId: string) {
    await removeItemMut.mutateAsync({ collection_id: collectionId, item_id: itemId });
    utils.wishlistManagement.collections.listItems.invalidate({ collection_id: collectionId });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="mb-4 h-9 w-24" />
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="mb-6 h-4 w-64" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <QueryGuard query={{ isLoading }}>
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-4" asChild>
        <a href="/account/collections">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </a>
      </Button>

      <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-muted-foreground mb-6">{collection.description}</p>
      )}

      <div className="space-y-2">
        {(!itemsData?.items || itemsData.items.length === 0) ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("empty_collection")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          itemsData.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {item.product?.media?.[0]?.url && (
                  <img
                    src={item.product.media[0].url}
                    alt=""
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
                <span className="text-sm font-medium">
                  {item.product?.translations?.[0]?.name ?? item.product_id}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
    </QueryGuard>
  );
}
