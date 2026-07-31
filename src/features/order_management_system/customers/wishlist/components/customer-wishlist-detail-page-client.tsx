/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowLeft, Trash2, Heart } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { WishlistShareDialog } from "./wishlist-share-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUndoAction } from "@/hooks/use-undo-action";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import type { WishlistPriority, WishlistWithProduct } from "../types";
import Link from "next/link";

export function CustomerWishlistDetailPageClient({ wishlistId }: { wishlistId: string }) {
  const t = useTranslations("wishlist");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const { data: wishlist, isLoading } = trpc.wishlistManagement.wishlists.byId.useQuery({
    id: wishlistId,
  });
  const { data: itemsData } = trpc.wishlistManagement.wishlists.listItems.useQuery({
    wishlist_id: wishlistId,
    page: 1,
    limit: 100,
  });
  const removeItemMut = trpc.wishlistManagement.wishlists.removeItem.useMutation();
  const utils = trpc.useUtils();
  const { execute_with_undo } = useUndoAction();

  async function handleRemove(itemId: string) {
    const item = itemsData?.items?.find((i: WishlistWithProduct) => i.id === itemId);
    const itemName = (item as WishlistWithProduct | undefined)?.product?.translations?.[0]?.name ?? (item as WishlistWithProduct | undefined)?.product_id ?? itemId;

    await execute_with_undo({
      description: itemName,
      execute: async () => {
        await removeItemMut.mutateAsync({ id: itemId });
        await utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: wishlistId });
      },
      rollback: async () => {
        await utils.wishlistManagement.wishlists.listItems.invalidate({ wishlist_id: wishlistId });
      },
      undoTimeoutMs: 8_000,
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="mb-4 h-9 w-24" />
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
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
          <Link href="/account/wishlists">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Link>
        </Button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{wishlist.name}</h1>
            {wishlist.description && (
              <p className="text-muted-foreground mt-1">{wishlist.description}</p>
            )}
          </div>
          <WishlistShareDialog wishlistId={wishlistId} wishlistName={wishlist.name} />
        </div>

        <div className="space-y-2">
          {!itemsData?.items || itemsData.items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Heart className="size-6" />
                </EmptyMedia>
                <EmptyTitle>{t("empty_list_message")}</EmptyTitle>
                <EmptyDescription>{t("empty_list_hint")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            itemsData.items.map(
              (item: WishlistWithProduct) => (
                <div
                  key={item.id}
                  className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4"
                >
                  {item.product?.media?.[0]?.url && (
                    <img
                      src={item.product.media[0].url}
                      alt=""
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {item.product?.translations?.[0]?.name ?? item.product_id}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", priorityColors[item.priority as WishlistPriority])}
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {t("qty", { count: item.quantity })}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-muted-foreground mt-1 text-sm">{item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {item.current_price && <p className="font-semibold">{item.current_price} DA</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setRemoveTarget(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            )
          )}
        </div>
      </div>

      <AlertDialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_remove_item_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm_remove_item_description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("edit")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removeTarget) {
                  handleRemove(removeTarget);
                  setRemoveTarget(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryGuard>
  );
}
