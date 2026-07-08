"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoritesPageSkeleton } from "./favorites-page-skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";

export function CustomerFavoritesPageClient() {
  const t = useTranslations("wishlist");
  const [tab, setTab] = useState("products");
  const type = tab === "products" ? "product" : tab === "brands" ? "brand" : "category";
  const query = trpc.wishlistManagement.favorites.list.useQuery({
    page: 1,
    limit: 50,
    type: type as "product" | "brand" | "category",
  });
  const removeMut = trpc.wishlistManagement.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  async function handleRemove(id: string) {
    await removeMut.mutateAsync({ id });
    utils.wishlistManagement.favorites.list.invalidate();
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
                      onClick={() => handleRemove(fav.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </QueryGuard>
  );
}
