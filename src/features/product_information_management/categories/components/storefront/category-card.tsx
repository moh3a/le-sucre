"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataState } from "@/components/storefront/data-state";
import { Link } from "@/i18n/navigation";
import type { CategoryItem } from "@/components/storefront/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category?: CategoryItem;
  isLoading?: boolean;
  error?: unknown;
  variant?: "grid" | "home";
}

export function CategoryCard({ category, isLoading, error, variant = "grid" }: CategoryCardProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!category}
      loadingState={variant === "home" ? <CategoryHomeSkeleton /> : <CategoryGridSkeleton />}
      emptyState={null}
    >
      {category && variant === "home" ? (
        <Link href={`/c/${category.slug}`} className="group block">
          <Card className="group cursor-pointer overflow-hidden p-4 text-center transition-shadow hover:shadow-md h-full">
            <div className="bg-muted mx-auto mb-3 h-20 w-20 rounded-full transition-transform group-hover:scale-105" />
            <p className="text-sm font-medium">{category.name}</p>
          </Card>
        </Link>
      ) : category ? (
        <Link href={`/c/${category.slug}`} className="group block h-full">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">{category.name}</CardTitle>
              {category.description && (
                <CardDescription className="line-clamp-2">{category.description}</CardDescription>
              )}
            </CardHeader>
            {category.children.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {category.children.slice(0, 6).map((child) => (
                    <Badge
                      key={child.id}
                      variant="secondary"
                      className={cn(
                        "cursor-pointer text-xs font-normal transition-colors",
                        "bg-muted text-muted-foreground hover:bg-lemon-lime/20 hover:text-olive-leaf",
                      )}
                      asChild
                    >
                      <Link href={`/c/${child.slug}`}>{child.name}</Link>
                    </Badge>
                  ))}
                  {category.children.length > 6 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{category.children.length - 6}
                    </Badge>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </Link>
      ) : null}
    </DataState>
  );
}

function CategoryGridSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryHomeSkeleton() {
  return (
    <Card className="p-4 text-center">
      <Skeleton className="mx-auto mb-3 h-20 w-20 rounded-full" />
      <Skeleton className="mx-auto h-4 w-2/3" />
    </Card>
  );
}
