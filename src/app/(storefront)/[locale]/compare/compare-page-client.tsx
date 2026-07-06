"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { X, ShoppingCart, Check, Minus, CircleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import { trpc } from "@/components/providers/app-providers";
import { ProductImage } from "@/features/product_information_management/products/components/storefront/product-image";
import { ProductPrice } from "@/features/product_information_management/products/components/storefront/product-price";
import { ProductRating } from "@/features/product_information_management/products/components/storefront/product-rating";
import { AddProductDialog } from "@/features/product_information_management/products/components/storefront/add-product-dialog";
import type { CompareProductData } from "@/features/product_information_management/catalog_discovery/models/compare.dto";

interface ComparePageClientProps {
  initialSlugs: string[];
  locale: "fr" | "en" | "ar";
}

export function ComparePageClient({ initialSlugs, locale }: ComparePageClientProps) {
  const t = useTranslations("compare");
  const router = useRouter();
  const searchParams = useSearchParams();

  const slugs = searchParams.get("slugs")?.split(",").filter(Boolean) ?? initialSlugs;

  const { data, isLoading, error } = trpc.catalog.compare.useQuery(
    { slugs, locale },
    { enabled: slugs.length > 0 },
  );

  const updateSlugs = useCallback(
    (newSlugs: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSlugs.length > 0) {
        params.set("slugs", newSlugs.join(","));
      } else {
        params.delete("slugs");
      }
      router.replace(`/compare?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleRemove = useCallback(
    (slug: string) => {
      updateSlugs(slugs.filter((s: string) => s !== slug));
    },
    [slugs, updateSlugs],
  );

  const handleAdd = useCallback(
    (newSlug: string) => {
      if (!slugs.includes(newSlug)) {
        updateSlugs([...slugs, newSlug]);
      }
    },
    [slugs, updateSlugs],
  );

  if (isLoading) {
    return <CompareSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mx-auto max-w-lg">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <AlertTitle>{t("error_title") || "Erreur"}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!slugs.length || !data?.products.length) {
    return <CompareEmpty slugs={slugs} onAdd={handleAdd} />;
  }

  const products = data.products;

  const allSpecLabels = Array.from(
    new Set(products.flatMap((p) => p.specs.map((s) => s.label))),
  );

  const basicFeatures = [
    { key: "image", label: t("image") },
    { key: "name", label: t("name") },
    { key: "price", label: t("price") },
    { key: "rating", label: t("rating") },
    { key: "description", label: t("description") },
  ] as const;

  const hasSpecs = allSpecLabels.length > 0;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("compared_products", { count: products.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddProductDialog
            onSelect={handleAdd}
            existingSlugs={slugs}
            categoryId={data.category?.id}
            trigger={<Button variant="outline">+ {t("addProduct")}</Button>}
          />
        </div>
      </div>

      <Separator />

      <section className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className="mb-8 grid gap-6"
            style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
          >
            <div />
            {products.map((product) => (
              <div key={product.id} className="group relative flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => handleRemove(product.slug)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label={t("remove")}
                >
                  <X className="h-3 w-3" />
                </button>
                <ProductImage
                  src={product.image_url ?? undefined}
                  alt={product.name}
                  className="mb-3 aspect-square w-full max-w-40 rounded-lg object-cover"
                  fallback={product.name.charAt(0)}
                />
                <p className="mb-1 text-sm font-medium">{product.name}</p>
                <ProductPrice
                  price={String(product.base_price)}
                  originalPrice={product.offer_price != null ? String(product.offer_price) : null}
                  currency={product.currency}
                  size="sm"
                />
                <Button size="sm" variant="default" className="mt-3 gap-2 rounded-full text-xs">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {t("add_to_cart") || "Ajouter"}
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-0 rounded-lg border">
            <FeatureRow
              label={t("name")}
              products={products}
              render={(p) => (
                <span className="font-medium">{p.name}</span>
              )}
            />
            <FeatureRow
              label={t("price")}
              products={products}
              render={(p) => (
                <ProductPrice
                  price={String(p.base_price)}
                  originalPrice={p.offer_price != null ? String(p.offer_price) : null}
                  currency={p.currency}
                  size="sm"
                />
              )}
            />
            <FeatureRow
              label={t("rating")}
              products={products}
              render={(p) => (
                <ProductRating
                  rating={Math.round(p.average_rating)}
                  reviewCount={p.review_count}
                  size="sm"
                />
              )}
            />
            <FeatureRow
              label={t("description")}
              products={products}
              render={(p) => (
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {p.description || "-"}
                </p>
              )}
            />
            <FeatureRow
              label={t("availability")}
              products={products}
              render={(p) =>
                p.in_stock ? (
                  <Badge variant="secondary" className="gap-1 rounded-full text-xs">
                    <Check className="h-3 w-3" />
                    {t("in_stock") || "En stock"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 rounded-full text-xs text-muted-foreground">
                    <Minus className="h-3 w-3" />
                    {t("out_of_stock") || "Rupture"}
                  </Badge>
                )
              }
            />

            {hasSpecs && (
              <>
                <div className="bg-muted/50 border-t px-4 py-3">
                  <h3 className="text-sm font-semibold">{t("specs")}</h3>
                </div>
                {allSpecLabels.map((specLabel) => {
                  const specValue = (p: CompareProductData) => {
                    const found = p.specs.find((s) => s.label === specLabel);
                    return found?.value ?? "-";
                  };
                  return (
                    <FeatureRow
                      key={specLabel}
                      label={specLabel}
                      products={products}
                      render={(p) => {
                        const val = specValue(p);
                        return val === "true" || val === "false" ? (
                          val === "true" ? (
                            <Badge variant="secondary" className="gap-1 rounded-full text-xs">
                              <Check className="h-3 w-3" />
                              {t("yes") || "Oui"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              {t("no") || "Non"}
                            </span>
                          )
                        ) : (
                          <span className="text-sm">{val}</span>
                        );
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureRow<T>({
  label,
  products,
  render,
}: {
  label: string;
  products: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <div
      className="grid items-center border-b last:border-0"
      style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
    >
      <div className="bg-muted/30 px-4 py-3">
        <span className="text-sm font-medium">{label}</span>
      </div>
      {products.map((product, i) => (
        <div key={i} className="px-4 py-3">
          {render(product)}
        </div>
      ))}
    </div>
  );
}

function CompareEmpty({
  slugs,
  onAdd,
}: {
  slugs: string[];
  onAdd: (slug: string) => void;
}) {
  const t = useTranslations("compare");
  const router = useRouter();

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
      </div>
      <Separator />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <span className="text-2xl">{String.fromCodePoint(0x21C4)}</span>
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-3">
            <AddProductDialog
              onSelect={onAdd}
              existingSlugs={slugs}
              trigger={<Button variant="outline">{t("addProduct")}</Button>}
            />
            <Button variant="link" onClick={() => router.push("/search")}>
              {t("browseProducts")}
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}

function CompareSkeleton() {
  const t = useTranslations("compare");
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>
      <Separator />
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "200px repeat(3, 1fr)" }}
      >
        <div />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <Skeleton className="aspect-square w-full max-w-40 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-8 w-28 rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-0 rounded-lg border">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid items-center border-b last:border-0"
            style={{ gridTemplateColumns: "200px repeat(3, 1fr)" }}
          >
            <div className="bg-muted/30 px-4 py-3">
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
