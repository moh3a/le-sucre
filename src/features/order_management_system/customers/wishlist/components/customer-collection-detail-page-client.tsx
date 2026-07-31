/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
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
import Link from "next/link";

export function CustomerCollectionDetailPageClient({ collectionId }: { collectionId: string }) {
  const t = useTranslations("wishlist");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const { data: collection, isLoading } = trpc.wishlistManagement.collections.byId.useQuery({
    id: collectionId,
  });
  const { data: itemsData } = trpc.wishlistManagement.collections.listItems.useQuery({
    collection_id: collectionId,
    page: 1,
    limit: 100,
  });
  const removeItemMut = trpc.wishlistManagement.collections.removeItem.useMutation();
  const utils = trpc.useUtils();

  async function handleRemove(itemId: string) {
    try {
      await removeItemMut.mutateAsync({ collection_id: collectionId, item_id: itemId });
      toast.success(t("item_removed"));
      utils.wishlistManagement.collections.listItems.invalidate({ collection_id: collectionId });
    } catch {
      toast.error(t("item_removed"));
    }
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

  if (!collection) return null;

  return (
    <QueryGuard query={{ isLoading }}>
      <div className="container mx-auto py-6">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/account/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Link>
        </Button>

        <h1 className="mb-2 text-2xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground mb-6">{collection.description}</p>
        )}

        <div className="space-y-2">
          {!itemsData?.items || itemsData.items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("empty_collection")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            itemsData.items.map(
              (item: {
                id: string;
                product_id: string;
                product?: { media?: { url?: string }[]; translations?: { name?: string }[] };
              }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {item.product?.media?.[0]?.url && (
                      <img
                        src={item.product.media[0].url}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
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
            <AlertDialogTitle>{t("confirm_remove_collection_item_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm_remove_collection_item_description")}
            </AlertDialogDescription>
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
