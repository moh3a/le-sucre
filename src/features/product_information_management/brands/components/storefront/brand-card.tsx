/* eslint-disable @next/next/no-img-element */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataState } from "@/components/storefront/data-state";
import type { BrandItem } from "@/components/storefront/types";

interface BrandCardProps {
  brand?: BrandItem;
  isLoading?: boolean;
  error?: unknown;
  variant?: "featured" | "list";
}

export function BrandCard({ brand, isLoading, error, variant = "list" }: BrandCardProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!brand}
      loadingState={<BrandCardSkeleton variant={variant} />}
      emptyState={null}
    >
      {brand && variant === "featured" ? (
        <Card className="bg-chiffon">
          <CardHeader>
            <div className="bg-muted mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-xs">{brand.name.charAt(0)}</span>
              )}
            </div>
            <CardTitle className="text-center text-lg">{brand.name}</CardTitle>
            <CardDescription className="text-center">
              {brand.product_count} produits
            </CardDescription>
          </CardHeader>
        </Card>
      ) : brand ? (
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-xs">{brand.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <CardTitle className="text-sm">{brand.name}</CardTitle>
              <CardDescription>{brand.product_count} produits</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ) : null}
    </DataState>
  );
}

function BrandCardSkeleton({ variant }: { variant: "featured" | "list" }) {
  if (variant === "featured") {
    return (
      <Card>
        <CardHeader className="items-center">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardHeader>
    </Card>
  );
}
