"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductVariantsPanel } from "@/features/product_information_management/variants/components/product-variants-panel";
import { ProductInventoryPanel } from "@/features/inventory_management_system/inventory/components/product-inventory-panel";
import { ProductRatingSummary } from "@/features/product_reviews_management/components/product-rating-summary";
import { ProductReviewsList } from "@/features/product_reviews_management/components/product-reviews-list";
import { ProductMediaGallery } from "./product-media-gallery";
import { ProductOrdersPanel } from "./product-orders-panel";
import { ProductDetailGeneralTab } from "./general-tab";
import { ProductAnalyticsPanel } from "./product-analytics-panel";
import { ProductRecommendationsTab } from "./product-recommendations-tab";
import { ProductChangeLog } from "@/features/product_information_management/products/operations/components/product-change-log";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

const outer_tab_schema = z.enum([
  "general",
  "variants",
  "orders",
  "inventory",
  "media",
  "reviews",
  "analytics",
  "recommendations",
  "journal",
]);

type Props = {
  product_id: string;
};

export function ProductDetailTabs({ product_id }: Props) {
  const product_details_query = trpc.products.byId.useQuery({ id: product_id });
  const product = product_details_query.data?.product;
  const translations = product_details_query.data?.translations;
  const media = product_details_query.data?.media;

  const router = useRouter();
  const searchParams = useSearchParams();
  const fr = translations?.find((t) => t.locale === "fr");

  const parsed = outer_tab_schema.safeParse(searchParams.get("tab"));
  const active_tab = parsed.success ? parsed.data : "general";

  const on_tab_change = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <QueryGuard query={product_details_query}>
    <div className="space-y-6">
      {product && (
        <>
          <div>
            <h1 className="font-heading text-2xl font-bold">{fr?.name ?? product.slug}</h1>
            <p className="text-muted-foreground text-sm">Product details</p>
          </div>

          <Tabs value={active_tab} onValueChange={on_tab_change}>
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
              <TabsTrigger value="analytics">Analytique</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              <TabsTrigger value="journal">Journal</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              {translations && (
                <ProductDetailGeneralTab
                  product_id={product_id}
                  product={product}
                  translations={translations}
                />
              )}
            </TabsContent>

            <TabsContent value="variants">
              <ProductVariantsPanel
                product_id={product_id}
                product_sku={product.sku}
                currency={product.currency}
                has_variants={product.has_variants}
              />
            </TabsContent>

            <TabsContent value="orders">
              <ProductOrdersPanel product_id={product_id} />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <ProductInventoryPanel product_id={product_id} />
            </TabsContent>

            <TabsContent value="media">
              {media && <ProductMediaGallery product_id={product_id} initial_media={media} />}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <ProductRatingSummary product_id={product_id} />
              <ProductReviewsList product_id={product_id} />
            </TabsContent>

            <TabsContent value="analytics">
              <ProductAnalyticsPanel product_id={product_id} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <ProductRecommendationsTab product_id={product_id} />
            </TabsContent>

            <TabsContent value="journal" className="space-y-6">
              <ProductChangeLog product_id={product_id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
    </QueryGuard>
  );
}
