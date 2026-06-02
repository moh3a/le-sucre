"use client";

import z from "zod";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductMediaGallery } from "./product-media-gallery";
import { ProductVariantsPanel } from "@/features/product_information_management/variants/components/product-variants-panel";
import { ProductInventoryPanel } from "@/features/inventory_management_system/inventory/components/product-inventory-panel";
import { ProductRatingSummary } from "@/features/product_reviews_management/components/product-rating-summary";
import { ProductReviewsList } from "@/features/product_reviews_management/components/product-reviews-list";
import { ProductOrdersPanel } from "./product-orders-panel";
import { ProductAnalyticsPanel } from "../product-analytics-panel";
import { product_media_dto, upsert_translation_dto } from "../../models/product.dto";
import { ProductDetailGeneralTab } from "./general-tab";

const product_media_with_id = product_media_dto.and(z.object({ id: z.string() }));

type Props = {
  product_id: string;
  product: {
    sku: string;
    slug: string;
    status: string;
    base_price: string;
    offer_price: string | null;
    currency: string;
  };
  translations: Array<z.infer<typeof upsert_translation_dto>>;
  media: Array<z.infer<typeof product_media_with_id>>;
};

export function ProductDetailTabs({ product_id, product, translations, media }: Props) {
  const fr = translations.find((t) => t.locale === "fr");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{fr?.name ?? product.slug}</h1>
          <p className="text-muted-foreground text-sm">
            SKU {product.sku} · {product.slug}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/console/products/${product_id}/edit`}>Modifier</Link>
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <ProductDetailGeneralTab
            product_id={product_id}
            product={product}
            translations={translations}
          />
        </TabsContent>

        <TabsContent value="variants">
          <ProductVariantsPanel
            product_id={product_id}
            product_sku={product.sku}
            currency={product.currency}
          />
        </TabsContent>

        <TabsContent value="orders">
          <ProductOrdersPanel product_id={product_id} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <ProductInventoryPanel product_id={product_id} />
        </TabsContent>

        <TabsContent value="media">
          <ProductMediaGallery product_id={product_id} initial_media={media} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <ProductRatingSummary product_id={product_id} />
          <ProductReviewsList product_id={product_id} />
        </TabsContent>

        <TabsContent value="analytics">
          <ProductAnalyticsPanel product_id={product_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
