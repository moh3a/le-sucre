"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoritesPageSkeleton } from "./favorites-page-skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
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

export function CustomerFavoritesPageClient() {
  const t = useTranslations("wishlist");
  const [tab, setTab] = useState("products");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const type = tab === "products" ? "product" : tab === "brands" ? "brand" : "category";
  const query = trpc.wishlistManagement.favorites.list.useQuery({
    page: 1,
    limit: 50,
    type: type as "product" | "brand" | "category",
  });
  const removeMut = trpc.wishlistManagement.favorites.remove.useMutation();
  const utils = trpc.useUtils();
  const { execute_with_undo } = useUndoAction();

  function handleRemove(id: string) {
    setPendingId(id);
    try {
      const fav = query.data?.items?.find((f: { id: string }) => f.id === id);
      const name = fav?.product_id ?? fav?.brand_id ?? fav?.category_id ?? id;
      execute_with_undo({
        description: name,
        execute: async () => {
          await removeMut.mutateAsync({ id });
          await utils.wishlistManagement.favorites.list.invalidate();
        },
        rollback: () => {
          utils.wishlistManagement.favorites.list.invalidate();
        },
        undoTimeoutMs: 8_000,
      });
    } catch {
      toast.error(t("favorite_removed"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <QueryGuard
      query={{ isLoading: query.isLoading, error: query.error }}
      loadingFallback={<FavoritesPageSkeleton />}
    >
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">{t("my_favorites")}</h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="products">{t("products")}</TabsTrigger>
            <TabsTrigger value="brands">{t("brands")}</TabsTrigger>
            <TabsTrigger value="categories">{t("categories")}</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {!query.data?.items?.length ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Heart className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>{t("no_favorites")}</EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {query.data.items.map((fav: { id: string; product_id?: string | null; brand_id?: string | null; category_id?: string | null }) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      <span className="text-sm">
                        {fav.product_id ?? fav.brand_id ?? fav.category_id}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      disabled={pendingId === fav.id}
                      onClick={() => setRemoveTarget(fav.id)}
                    >
                      {pendingId === fav.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_remove_favorite_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm_remove_favorite_description")}</AlertDialogDescription>
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
