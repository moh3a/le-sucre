"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, Sparkles } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { ProductCard, ProductCardSkeleton } from "@/features/product_information_management/products/components/storefront/product-card";
import type { AppLocale } from "@/i18n/config";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";

export function NewArrivalsContent({ locale }: { locale: AppLocale }) {
  const t = useTranslations("newArrivals");
  const [page, setPage] = useState(1);
  const limit = 24;

  const query = trpc.catalog.search.useQuery({
    locale: (locale === "ar" ? "fr" : locale) as "fr" | "en",
    sort: "newest",
    page,
    limit,
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto container space-y-12 px-4 py-8">
        <section className="flex items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </section>
        <Separator />
        <section>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="mx-auto container px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("title")}</AlertTitle>
            <AlertDescription>
              {query.error instanceof Error
                ? query.error.message
                : t("error_loading")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { items, meta } = query.data ?? { items: [], meta: null };
  const totalPages = meta?.total_pages ?? 1;

  const empty = items.length === 0;

  return (
    <div className="mx-auto container space-y-12 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Badge variant="default" className="shrink-0 gap-1">
          <Sparkles className="h-3 w-3" />
          {t("nouveau")}
        </Badge>
      </section>

      <Separator />

      {/* PRODUCT GRID */}
      <section>
        {empty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    id: item.id,
                    slug: item.slug,
                    name: item.name,
                    image_url: item.image_url,
                    currency: item.currency,
                    min_price: item.min_price,
                    max_price: item.max_price,
                    is_featured: item.is_featured,
                    in_stock: item.in_stock,
                    brand_name: item.brand_name,
                  }}
                  variant="catalog"
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("previous")}
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        className="min-w-9"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("next")}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
