"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, Clock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/components/providers/app-providers";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/features/product_information_management/products/components/storefront/product-card";
import { useStorefrontCart } from "@/features/order_management_system/carts/hooks/use-storefront-cart";
import type { AppLocale } from "@/i18n/config";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

function useCountdown(targetSeconds: number | null) {
  const [remaining, setRemaining] = useState(targetSeconds ?? 0);

  useEffect(() => {
    if (targetSeconds === null || targetSeconds <= 0) return;

    const endTime = Date.now() + targetSeconds * 1000;

    const interval = setInterval(() => {
      setRemaining(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetSeconds]);

  return remaining;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface FlashSaleState {
  campaign_id: string;
  name: string;
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  time_remaining_seconds: number;
  is_active: boolean;
  is_ending_soon: boolean;
  product_ids: string[];
}

type SaleStatus = "active" | "upcoming" | "ended";

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

export function FlashSalesContent({ locale }: { locale: AppLocale }) {
  const t = useTranslations("flashSales");

  const active_query = trpc.campaigns.activeFlashSales.useQuery({ locale });
  const upcoming_query = trpc.campaigns.upcomingFlashSales.useQuery();
  const ended_query = trpc.campaigns.endedFlashSales.useQuery();

  const loading =
    active_query.isLoading || upcoming_query.isLoading || ended_query.isLoading;
  const error = active_query.error ?? upcoming_query.error ?? ended_query.error;

  if (loading) {
    return (
      <div className="container mx-auto space-y-12 px-4 py-8">
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="mt-1 h-4 w-36" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((p) => (
                      <Skeleton key={p} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("activeSales")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t("error_loading")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const active_sales = active_query.data ?? [];
  const upcoming_sales = upcoming_query.data ?? [];
  const ended_sales = ended_query.data ?? [];

  const empty = active_sales.length === 0;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* ACTIVE FLASH SALES */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t("activeSales")}</h1>
          <Badge variant="destructive" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {t("live")}
          </Badge>
        </div>

        {empty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty_active")}</EmptyTitle>
              <EmptyDescription>{t("empty_active_subtitle")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {active_sales.map((sale) => (
              <FlashSaleCard key={sale.campaign_id} sale={sale} locale={locale} status="active" />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* UPCOMING FLASH SALES */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("upcoming")}</h2>
        {upcoming_sales.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {upcoming_sales.map((sale) => (
              <FlashSaleCard key={sale.campaign_id} sale={sale} locale={locale} status="upcoming" />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty_upcoming")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <Separator />

      {/* ENDED FLASH SALES */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("ended")}</h2>
        {ended_sales.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {ended_sales.map((sale) => (
              <FlashSaleCard key={sale.campaign_id} sale={sale} locale={locale} status="ended" />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("empty_ended")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  );
}

function FlashSaleCard({
  sale,
  locale,
  status,
}: {
  sale: FlashSaleState;
  locale: AppLocale;
  status: SaleStatus;
}) {
  const t = useTranslations("flashSales");
  const remaining = useCountdown(status === "active" ? sale.time_remaining_seconds : null);
  const endingSoon = status === "active" && (sale.is_ending_soon || remaining < 3600);
  const { add_product } = useStorefrontCart();

  const products_query = trpc.recommendations.hydrate.useQuery(
    {
      locale,
      ids: sale.product_ids.slice(0, 4),
    },
    { enabled: sale.product_ids.length > 0 },
  );

  const products = products_query.data ?? [];

  return (
    <Card className={cn(endingSoon && "ring-destructive/30 ring-2")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{sale.name}</CardTitle>
          {status === "active" ? (
            <Badge
              variant={endingSoon ? "destructive" : "outline"}
              className="animate-pulse font-mono text-base tabular-nums"
            >
              {formatCountdown(remaining)}
            </Badge>
          ) : (
            <Badge variant="outline">{status === "upcoming" ? t("upcoming") : t("ended")}</Badge>
          )}
        </div>
        <CardDescription>{t("limitedTime")}</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={toStorefrontProduct(product)}
                variant="flash-sale"
                onAddToCart={() => void add_product({ product_id: product.id })}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((p) => (
              <ProductCardSkeleton key={p} variant="flash-sale" />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={endingSoon ? "default" : "outline"}>
          {t("viewAll")}
        </Button>
      </CardFooter>
    </Card>
  );
}
