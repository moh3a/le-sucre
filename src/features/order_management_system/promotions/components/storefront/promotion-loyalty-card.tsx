"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/storefront/data-state";

interface PromotionLoyaltyCardProps {
  title?: string;
  description?: string;
  pointsLabel?: string;
  ctaLabel?: string;
  isLoading?: boolean;
  error?: unknown;
  onCta?: () => void;
}

export function PromotionLoyaltyCard({
  title = "Programme de fidélité",
  description = "Gagnez des points à chaque achat et profitez d'avantages exclusifs.",
  pointsLabel = "Gagnez des points",
  ctaLabel = "En savoir plus",
  isLoading,
  error,
  onCta,
}: PromotionLoyaltyCardProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={false}
      loadingState={
        <Card className="bg-cream">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardContent>
        </Card>
      }
    >
      <Card className="bg-cream">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {pointsLabel}
          </Badge>
          <Button onClick={onCta}>{ctaLabel}</Button>
        </CardContent>
      </Card>
    </DataState>
  );
}
