"use client";

import { Heart, ExternalLink, Tag, Folder } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type Favorite = {
  id: string;
  product_id: string | null;
  brand_id: string | null;
  category_id: string | null;
  created_at: string;
};

export function CustomerFavoritesTab({
  favorites,
}: {
  favorites: { items: Favorite[]; total: number };
}) {
  const t = useTranslations("orders");

  const product_favorites = favorites.items.filter((f) => f.product_id);
  const brand_favorites = favorites.items.filter((f) => f.brand_id);
  const category_favorites = favorites.items.filter((f) => f.category_id);

  if (favorites.items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Heart className="mb-2 h-10 w-10" />
        <p>{t("no_favorites")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {product_favorites.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">{t("favorite_products")} ({product_favorites.length})</h3>
          <div className="space-y-2">
            {product_favorites.map((fav) => (
              <Card key={fav.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      <div>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                          <span className="font-mono">{fav.product_id!.slice(0, 16)}…</span>
                          <Link
                            href={`/console/products/${fav.product_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </CardTitle>
                        <p className="text-muted-foreground text-xs">{formatDate(fav.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {brand_favorites.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">{t("favorite_brands")} ({brand_favorites.length})</h3>
          <div className="flex flex-wrap gap-2">
            {brand_favorites.map((fav) => (
              <Badge key={fav.id} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {fav.brand_id!.slice(0, 16)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {category_favorites.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">{t("favorite_categories")} ({category_favorites.length})</h3>
          <div className="flex flex-wrap gap-2">
            {category_favorites.map((fav) => (
              <Badge key={fav.id} variant="secondary" className="gap-1">
                <Folder className="h-3 w-3" />
                {fav.category_id!.slice(0, 16)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
