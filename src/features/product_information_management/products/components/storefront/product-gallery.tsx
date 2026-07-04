"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DataState } from "@/components/storefront/data-state";
import { ProductImage } from "@/components/storefront/product/product-image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images?: string[];
  alt?: string;
  isLoading?: boolean;
  error?: unknown;
}

export function ProductGallery({ images = [], alt, isLoading, error }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!images.length}
      loadingState={
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square w-20 rounded-lg" />
            ))}
          </div>
        </div>
      }
      emptyState={
        <Card className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
          Aucune image
        </Card>
      }
    >
      <div className="space-y-4">
        <Card className="aspect-square w-full overflow-hidden bg-muted">
          <ProductImage
            src={images[selectedIndex]}
            alt={alt ?? `Product image ${selectedIndex + 1}`}
            className="h-full w-full object-cover"
          />
        </Card>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                  selectedIndex === i ? "border-primary" : "border-transparent hover:border-muted-foreground/30",
                )}
              >
                <ProductImage src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </DataState>
  );
}
