"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataState } from "@/components/storefront/data-state";
import { ProductImage } from "@/components/storefront/product/product-image";
import { ProductQuantitySelector } from "@/components/storefront/product/product-quantity-selector";
import type { StorefrontProduct } from "@/components/storefront/types";
import { cn } from "@/lib/utils";

export interface CartItemData {
  id: string;
  product: StorefrontProduct;
  quantity: number;
  variant_label?: string;
  unit_price: string;
  line_total: string;
}

interface CartItemCardProps {
  item?: CartItemData;
  isLoading?: boolean;
  error?: unknown;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
  localeLabels?: {
    remove?: string;
    out_of_stock?: string;
  };
}

export function CartItemCard({
  item,
  isLoading,
  error,
  onQuantityChange,
  onRemove,
  localeLabels,
}: CartItemCardProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!item}
      loadingState={<CartItemCardSkeleton />}
      emptyTitle=""
    >
      {item && (
        <Card className="flex gap-4 p-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
            <ProductImage
              src={item.product.image_url ?? undefined}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium">{item.product.name}</h3>
              {item.variant_label && (
                <p className="text-muted-foreground text-xs">{item.variant_label}</p>
              )}
              {!item.product.in_stock && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  {localeLabels?.out_of_stock ?? "Rupture de stock"}
                </p>
              )}
            </div>
            <p className="text-sm font-semibold">{item.line_total}</p>
          </div>
          <div className="flex flex-col items-end justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8"
              onClick={() => onRemove?.(item.id)}
            >
              ✕
            </Button>
            <ProductQuantitySelector
              value={item.quantity}
              onChange={(qty) => onQuantityChange?.(item.id, qty)}
            />
          </div>
        </Card>
      )}
    </DataState>
  );
}

function CartItemCardSkeleton() {
  return (
    <Card className="flex gap-4 p-4">
      <Skeleton className="h-24 w-24 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex flex-col items-end justify-between">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </Card>
  );
}
