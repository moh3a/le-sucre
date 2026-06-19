"use client";

import { trpc } from "@/components/providers/app-providers";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerCollectionDetailPageClient({ collectionId }: { collectionId: string }) {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return <div className="text-center py-20 text-muted-foreground">Collection introuvable</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-4" asChild>
        <a href="/account/collections">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </a>
      </Button>

      <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-muted-foreground mb-6">{collection.description}</p>
      )}

      <div className="space-y-2">
        {(!itemsData?.items || itemsData.items.length === 0) ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Cette collection est vide</p>
          </div>
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
  );
}
