"use client";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CatalogProductCard as ProductType } from "../types";

interface CatalogProductGridProps {
  products: ProductType[];
  isLoading?: boolean;
}

export function CatalogProductGrid({ products, isLoading }: CatalogProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="border-secondary/20 animate-pulse overflow-hidden border bg-background"
          >
            <div className="bg-muted aspect-square" />
            <CardContent className="space-y-3 p-4">
              <div className="bg-muted h-4 w-2/3 rounded" />
              <div className="bg-muted h-4 w-1/2 rounded" />
              <div className="bg-muted h-4 w-1/3 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="border-secondary/15 rounded-2xl border bg-cream/40 py-20 text-center">
        <p className="text-secondary/70 font-moya text-lg">
          Aucun produit ne correspond à vos critères.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const has_discount = product.max_price && product.min_price !== product.max_price;

        return (
          <Link href={`/products/${product.slug}`} key={product.id} className="group">
            <Card className="flex h-full flex-col overflow-hidden border border-primary-foreground/15 bg-background transition-all duration-300 hover:border-crimson-violet/40 hover:shadow-xl">
              {/* Image and Badge */}
              <div className="relative aspect-square overflow-hidden bg-cream/20">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="font-moya flex h-full w-full items-center justify-center bg-primary-foreground/5 text-primary-foreground/40">
                    Aucune image
                  </div>
                )}

                {/* Stock or Featured Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                  {!product.in_stock && (
                    <Badge className="font-moya border-0 bg-red-600 px-2 py-0.5 text-white">
                      Rupture
                    </Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="font-moya border-0 bg-crimson-violet px-2 py-0.5 text-white">
                      Coup de cœur
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contents */}
              <CardContent className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-1">
                  {product.brand_name && (
                    <p className="font-moya text-xs font-semibold tracking-wider text-primary-foreground/60 uppercase">
                      {product.brand_name}
                    </p>
                  )}
                  <h3 className="font-orla line-clamp-2 text-base leading-snug text-primary-foreground transition-colors group-hover:text-crimson-violet">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-primary-foreground/5 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-moya text-lg font-semibold text-crimson-violet">
                      {product.min_price} {product.currency}
                    </span>
                    {has_discount && (
                      <span className="font-moya text-sm text-primary-foreground/40 line-through">
                        {product.max_price} {product.currency}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
