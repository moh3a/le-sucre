"use client";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { WishlistShareDialog } from "./wishlist-share-dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WishlistPriority } from "../types";

export function CustomerWishlistDetailPageClient({ wishlistId }: { wishlistId: string }) {
  const t = useTranslations("wishlist");
  const { data: wishlist, isLoading } = trpc.wishlistManagement.wishlists.byId.useQuery({ id: wishlistId });
  const { data: itemsData } = trpc.wishlistManagement.wishlists.listItems.useQuery(
    { wishlist_id: wishlistId, page: 1, limit: 100 },
  );
  const removeItemMut = trpc.wishlistManagement.wishlists.removeItem.useMutation();
  const utils = trpc.useUtils();

  async function handleRemove(itemId: string) {
    await removeItemMut.mutateAsync({ id: itemId });
    utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: wishlistId });
  }

  if (!wishlist) return null;

  const priorityColors: Record<WishlistPriority, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-600",
    high: "bg-orange-100 text-orange-600",
    urgent: "bg-red-100 text-red-600",
  };

  return (
    <QueryGuard query={{ isLoading }}>
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-4" asChild>
        <a href="/account/wishlists">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </a>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{wishlist.name}</h1>
          {wishlist.description && (
            <p className="text-muted-foreground mt-1">{wishlist.description}</p>
          )}
        </div>
        <WishlistShareDialog wishlistId={wishlistId} wishlistName={wishlist.name} />
      </div>

      <div className="space-y-2">
        {(!itemsData?.items || itemsData.items.length === 0) ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">{t("empty_list_message")}</p>
            <p className="text-sm">{t("empty_list_hint")}</p>
          </div>
        ) : (
          itemsData.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
            >
              {item.product?.media?.[0]?.url && (
                <img
                  src={item.product.media[0].url}
                  alt=""
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {item.product?.translations?.[0]?.name ?? item.product_id}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", priorityColors[item.priority as WishlistPriority])}
                  >
                    {item.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{t("qty", { count: item.quantity })}</span>
                </div>
                {item.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                )}
              </div>
              <div className="text-right">
                {item.current_price && (
                  <p className="font-semibold">{item.current_price} DA</p>
                )}
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
