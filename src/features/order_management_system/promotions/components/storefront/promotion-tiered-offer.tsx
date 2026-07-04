"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataState } from "@/components/storefront/data-state";
import type { TieredOfferItem } from "@/components/storefront/types";

interface PromotionTieredOfferProps {
  offers?: TieredOfferItem[];
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: unknown;
}

export function PromotionTieredOffer({
  offers = [],
  title,
  description,
  isLoading,
  error,
}: PromotionTieredOfferProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!offers.length}
      loadingState={
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="items-center text-center">
                <Skeleton className="mb-2 h-5 w-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="text-center">
                <Skeleton className="mx-auto h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      }
      emptyState={null}
    >
      <div>
        {title && <h2 className="mb-2 text-2xl font-bold">{title}</h2>}
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.threshold}>
              <CardHeader className="text-center">
                <Badge variant="secondary" className="mb-2 self-center">
                  {offer.threshold}
                </Badge>
                <CardTitle className="text-xl">{offer.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">{offer.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DataState>
  );
}
