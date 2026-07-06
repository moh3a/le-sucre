"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DataState } from "@/components/storefront/data-state";
import { ProductRating } from "@/features/product_information_management/products/components/storefront/product-rating";
import type { ReviewItem } from "@/components/storefront/types";
import { Star } from "lucide-react";

interface ProductReviewsProps {
  title?: string;
  reviews?: ReviewItem[];
  isLoading?: boolean;
  error?: unknown;
}

export function ProductReviews({
  title = "Avis clients",
  reviews = [],
  isLoading,
  error,
}: ProductReviewsProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={!reviews.length}
        loadingState={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        }
        emptyState={
          <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <Star className="mb-2 h-8 w-8 opacity-30" />
            <p>Aucun avis pour le moment.</p>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{review.author_name}</span>
                <ProductRating rating={review.rating} showCount={false} />
              </div>
              <p className="text-muted-foreground text-sm">{review.content}</p>
              <p className="text-muted-foreground text-xs">{review.date}</p>
            </Card>
          ))}
        </div>
      </DataState>
    </section>
  );
}
