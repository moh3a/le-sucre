"use client";

import Link from "next/link";
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
            className="border-secondary/20 animate-pulse overflow-hidden border bg-white"
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
      <div className="border-secondary/15 rounded-2xl border bg-[#fff3e3]/40 py-20 text-center">
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
            <Card className="flex h-full flex-col overflow-hidden border border-[#4d4c20]/15 bg-white transition-all duration-300 hover:border-[#700145]/40 hover:shadow-xl">
              {/* Image and Badge */}
              <div className="relative aspect-square overflow-hidden bg-[#fff3e3]/20">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="font-moya flex h-full w-full items-center justify-center bg-[#4d4c20]/5 text-[#4d4c20]/40">
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
                    <Badge className="font-moya border-0 bg-[#700145] px-2 py-0.5 text-white">
                      Coup de cœur
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contents */}
              <CardContent className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-1">
                  {product.brand_name && (
                    <p className="font-moya text-xs font-semibold tracking-wider text-[#4d4c20]/60 uppercase">
                      {product.brand_name}
                    </p>
                  )}
                  <h3 className="font-orla line-clamp-2 text-base leading-snug text-[#4d4c20] transition-colors group-hover:text-[#700145]">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-[#4d4c20]/5 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-moya text-lg font-semibold text-[#700145]">
                      {product.min_price} {product.currency}
                    </span>
                    {has_discount && (
                      <span className="font-moya text-sm text-[#4d4c20]/40 line-through">
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
