"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataState } from "@/components/storefront/data-state";
import { ProductImage } from "@/components/storefront/product/product-image";
import type { StorefrontProduct } from "@/components/storefront/types";

interface ReviewItem {
  product: StorefrontProduct;
  quantity: number;
  price: string;
}

interface CheckoutOrderReviewProps {
  title?: string;
  items?: ReviewItem[];
  ctaLabel?: string;
  isLoading?: boolean;
  error?: unknown;
  onCta?: () => void;
  ctaDisabled?: boolean;
}

export function CheckoutOrderReview({
  title = "Récapitulatif de la commande",
  items = [],
  ctaLabel = "Passer la commande",
  isLoading,
  error,
  onCta,
  ctaDisabled,
}: CheckoutOrderReviewProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!items.length}
      loadingState={
        <Card className="space-y-4 p-6">
          <Skeleton className="h-5 w-48" />
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-10 w-full rounded-md" />
        </Card>
      }
      emptyState={
        <Card className="p-6 text-center text-muted-foreground">
          Aucun article dans la commande.
        </Card>
      }
    >
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 py-2">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <ProductImage
                src={item.product.image_url ?? undefined}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.product.name}</p>
              <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold">{item.price}</p>
          </div>
        ))}
        <Separator />
        <Button className="w-full" disabled={ctaDisabled} onClick={onCta}>
          {ctaLabel}
        </Button>
      </Card>
    </DataState>
  );
}
