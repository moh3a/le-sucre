"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CustomerFavoritesPageClient() {
  const [tab, setTab] = useState("products");
  const type = tab === "products" ? "product" : tab === "brands" ? "brand" : "category";
  const { data, isLoading } = trpc.wishlistManagement.favorites.list.useQuery({ page: 1, limit: 50, type: type as any });
  const removeMut = trpc.wishlistManagement.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  async function handleRemove(id: string) {
    await removeMut.mutateAsync({ id });
    utils.wishlistManagement.favorites.list.invalidate();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="brands">Marques</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !data?.items?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucun favori</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.items.map((fav: any) => (
                <div
                  key={fav.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
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
                    className="h-8 w-8 text-destructive"
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
  );
}
