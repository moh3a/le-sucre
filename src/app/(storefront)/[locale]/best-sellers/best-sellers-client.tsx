"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/components/providers/app-providers";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/product/product-card";
import type { AppLocale } from "@/i18n/config";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

const CATEGORY_KEYS = [
  "category_all",
  "category_pastry",
  "category_chocolates",
  "category_candy",
  "category_lollipops",
] as const;

function toStorefrontProduct(item: {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  currency: string;
  min_price: string;
  max_price: string | null;
  is_featured: boolean;
  in_stock: boolean;
  brand_name: string | null;
}) {
  return {
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
  };
}

export function BestSellersContent({ locale }: { locale: AppLocale }) {
  const t = useTranslations("bestSellers");

  const trending_query = trpc.recommendations.trending.useQuery({
    locale,
    period: "week",
    limit: 48,
  });

  const trending_day_query = trpc.recommendations.trending.useQuery({
    locale,
    period: "day",
    limit: 8,
  });

  if (trending_query.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
        <section className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center">
            <Trophy className="h-8 w-8 text-muted-foreground/40" />
          </span>
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-1 h-4 w-72" />
          </div>
        </section>
        <Separator />
        <section>
          <Skeleton className="mb-6 h-7 w-40" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (trending_query.error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("title")}</AlertTitle>
            <AlertDescription>
              {trending_query.error instanceof Error
                ? trending_query.error.message
                : t("error_loading")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const all_items = trending_query.data ?? [];
  const day_items = trending_day_query.data ?? [];

  const ranked_items = all_items.slice(0, 10);
  const category_items = all_items.slice(10, 26);
  const trending_items = day_items.length > 0 ? day_items : all_items.slice(26, 34);

  const empty = all_items.length === 0;

  if (empty) {
    return (
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
        <section className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center">
            <Trophy className="h-8 w-8 text-muted-foreground/40" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("description")}</p>
          </div>
        </section>
        <Separator />
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trophy className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("empty")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center">
          <Trophy className="h-8 w-8" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
      </section>

      <Separator />

      {/* TOP RANKED PRODUCTS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("topRanked")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ranked_items.map((item, i) => (
            <Card key={item.id}>
              <CardHeader className="flex-row items-center gap-4">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold",
                    i < 3
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base">{item.name}</CardTitle>
                  <CardDescription>
                    {i < 3 ? (
                      <Badge variant="default" className="mt-1">
                        {t("topPick")}
                      </Badge>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />{" "}
                        {t("rating", { stars: 5 })}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="bg-muted h-20 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="bg-muted h-20 w-full rounded-lg" />
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <span className="font-semibold">{item.min_price} {item.currency}</span>
                <Button size="sm" disabled={!item.in_stock}>
                  {t("addToCart")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CATEGORY TOP SELLERS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("categoryTop")}</h2>
        <Tabs defaultValue={CATEGORY_KEYS[0]}>
          <TabsList className="mb-6">
            {CATEGORY_KEYS.map((key) => (
              <TabsTrigger key={key} value={key}>
                {t(key)}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORY_KEYS.map((key, catIdx) => {
            const cat_items = category_items.slice(
              catIdx * 4,
              catIdx * 4 + 4,
            );
            return (
              <TabsContent key={key} value={key}>
                {cat_items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {cat_items.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={toStorefrontProduct(item)}
                        variant="catalog"
                      />
                    ))}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>{t("empty_category")}</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      <Separator />

      {/* TRENDING NOW */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("trending")}</h2>
        {trending_items.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {trending_items.map((item) => (
              <Card key={item.id} className="min-w-[180px] shrink-0">
                <CardContent className="p-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="bg-muted aspect-square w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-muted aspect-square w-full rounded-lg" />
                  )}
                </CardContent>
                <CardHeader>
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                  <Badge variant="outline" className="mt-1 w-fit">
                    {t("trending")}
                  </Badge>
                  <p className="text-sm font-semibold">
                    {item.min_price} {item.currency}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Trophy className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty_trending")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  );
}
