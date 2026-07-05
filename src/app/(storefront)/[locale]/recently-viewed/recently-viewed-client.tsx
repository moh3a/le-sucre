"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, Clock } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/product/product-card";
import type { AppLocale } from "@/i18n/config";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";

function get_or_create_session_key(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem("session_key");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("session_key", key);
  }
  return key;
}

function useSessionKey() {
  const [key, setKey] = useState("");
  useEffect(() => {
    setKey(get_or_create_session_key());
  }, []);
  return key;
}

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

export function RecentlyViewedContent({ locale }: { locale: AppLocale }) {
  const t = useTranslations("recentlyViewed");
  const sessionKey = useSessionKey();

  const query = trpc.recommendations.recent.useQuery(
    { locale: locale === "ar" ? "fr" : locale, session_key: sessionKey, limit: 24 },
    { enabled: !!sessionKey },
  );

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
        <section className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-1 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
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
      <div className="mx-auto max-w-7xl px-4 py-8">
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

  const items = query.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" disabled>
            {t("clearHistory")}
          </Button>
        )}
      </section>

      <Separator />

      {items.length > 0 ? (
        /* PRODUCT GRID */
        <section>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={toStorefrontProduct(item)}
                variant="catalog"
              />
            ))}
          </div>
        </section>
      ) : (
        /* EMPTY STATE */
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="link" asChild>
              <a href={`/${locale}`}>{t("shopNow")}</a>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
