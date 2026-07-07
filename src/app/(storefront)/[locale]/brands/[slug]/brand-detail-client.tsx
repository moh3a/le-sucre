/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, ExternalLink, PackageOpen } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { ProductCard, ProductCardSkeleton } from "@/features/product_information_management/products/components/storefront/product-card";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import type { AppLocale } from "@/i18n/config";

interface Props {
  slug: string;
  locale: AppLocale;
}

export function BrandDetailClient({ slug, locale }: Props) {
  const t = useTranslations("brandDetail");

  const brand_query = trpc.brands.bySlug.useQuery({ slug });
  const brand = brand_query.data;

  const products_query = trpc.catalog.search.useQuery(
    {
      brand_ids: brand ? [brand.id] : [],
      locale: (locale === "ar" ? "fr" : locale) as "fr" | "en",
      limit: 60,
    },
    { enabled: !!brand },
  );

  if (brand_query.isLoading) {
    return <BrandDetailSkeleton />;
  }

  if (brand_query.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("brand")}</AlertTitle>
            <AlertDescription>
              {brand_query.error instanceof Error
                ? brand_query.error.message
                : t("error_loading")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("brand")}</EmptyTitle>
            <span className="text-muted-foreground text-sm">
              {t("error_loading")}
            </span>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const products = products_query.data?.items ?? [];
  const products_loading = products_query.isLoading;
  const products_error = products_query.error;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* BRAND HEADER */}
      <section className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="bg-muted flex h-24 w-24 shrink-0 items-center justify-center rounded-full">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-2xl font-bold">
              {brand.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{brand.name}</h1>
          {brand.description && (
            <p className="text-muted-foreground mt-2">{brand.description}</p>
          )}
          {brand.website_url && (
            <Button variant="link" className="mt-1 h-auto p-0" asChild>
              <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                {t("visitWebsite")}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </section>

      <Separator />

      {/* BRAND PRODUCTS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t("products")}
            {!products_loading && (
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                ({brand.product_count})
              </span>
            )}
          </h2>
        </div>

        {products_loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products_error ? (
          <div className="flex items-start justify-center p-6">
            <Alert variant="destructive" className="max-w-md">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <AlertTitle>{t("products")}</AlertTitle>
              <AlertDescription>
                {products_error instanceof Error
                  ? products_error.message
                  : t("error_loading")}
              </AlertDescription>
            </Alert>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((item) => (
              <ProductCard key={item.id} product={item} variant="catalog" />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageOpen className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("no_products")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <Separator />

      {/* ABOUT BRAND */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">
          {t("about", { brand: brand.name })}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {t("aboutText", { brand: brand.name })}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function BrandDetailSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <section className="flex flex-col items-center gap-4 sm:flex-row">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-72 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
        </div>
      </section>
      <Separator />
      <section>
        <Skeleton className="mb-4 h-7 w-32" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
      <Separator />
      <section>
        <Skeleton className="mb-4 h-7 w-48" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
