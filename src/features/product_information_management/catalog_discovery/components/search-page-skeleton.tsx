import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/features/product_information_management/products/components/storefront/product-card";

export function SearchPageSkeleton() {
  return (
    <div className="container mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 sm:h-8" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg lg:hidden" />
          <Skeleton className="h-9 w-[180px] rounded-lg" />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="space-y-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-3 py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </aside>

        {/* Results skeleton */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} variant="catalog" />
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="size-9 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
