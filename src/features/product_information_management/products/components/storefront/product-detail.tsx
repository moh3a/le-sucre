"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DataState } from "@/components/storefront/data-state";
import { ProductPrice } from "@/features/product_information_management/products/components/storefront/product-price";
import { ProductRating } from "@/features/product_information_management/products/components/storefront/product-rating";
import { ProductQuantitySelector } from "@/features/product_information_management/products/components/storefront/product-quantity-selector";
import { ProductVariantSelector } from "@/features/product_information_management/variants/components/product-variant-selector";
import type { StorefrontProduct, ReviewItem, SpecItem } from "@/components/storefront/types";

interface ProductDetailProps {
  product?: StorefrontProduct & {
    description?: string;
    rating?: number;
    reviewCount?: number;
    specs?: SpecItem[];
    reviews?: ReviewItem[];
    sizes?: string[];
  };
  isLoading?: boolean;
  error?: unknown;
  onAddToCart?: (quantity: number, variant?: string) => void;
  onAddToWishlist?: () => void;
}

export function ProductDetail({ product, isLoading, error, onAddToCart, onAddToWishlist }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>();

  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!product}
      loadingState={<ProductDetailSkeleton />}
      emptyState={null}
    >
      {product && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Images handled by ProductGallery separately */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Price */}
            <ProductPrice
              price={product.min_price}
              originalPrice={product.max_price}
              currency={product.currency}
              size="lg"
            />

            {/* Rating */}
            {product.rating !== undefined && (
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="md"
              />
            )}

            {/* Variant selector */}
            {product.sizes && product.sizes.length > 0 && (
              <ProductVariantSelector
                options={product.sizes}
                selected={selectedVariant}
                onChange={setSelectedVariant}
                label="Taille"
              />
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4">
              <ProductQuantitySelector value={quantity} onChange={setQuantity} />
              <Button
                className="flex-1"
                disabled={!product.in_stock}
                onClick={() => onAddToCart?.(quantity, selectedVariant)}
              >
                {product.in_stock ? "Ajouter au panier" : "Rupture de stock"}
              </Button>
            </div>

            {/* Wishlist */}
            <Button variant="outline" className="w-full" onClick={onAddToWishlist}>
              ♡ Ajouter à la wishlist
            </Button>

            {/* Shipping info */}
            <Card className="space-y-2 p-4 text-sm">
              <p>🚚 Livraison gratuite à partir de 5000 DZD</p>
              <p>🔄 Retours sous 14 jours</p>
            </Card>

            <Separator />

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground mt-2">{product.description}</p>
              </div>
            )}

            {/* Specs */}
            {product.specs && product.specs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Caractéristiques</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.label} className="border-b">
                        <td className="py-2 pr-4 font-medium text-muted-foreground">{spec.label}</td>
                        <td className="py-2">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DataState>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square w-20 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-12 rounded-md" />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
