// TODO this should have the ability to edit details, pricing, variants, inventory and everything related to products in tabs
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { product_service } from "@/features/product_information_management/products/services/product.service";
import { ProductMediaGallery } from "@/features/product_information_management/products/components/product-media-gallery";
import { ProductTranslationsPanel } from "@/features/product_information_management/products/components/product-translations-panel";
import { ProductVariantsPanel } from "@/features/product_information_management/variants/components/product-variants-panel";
import { Button } from "@/components/ui/button";
import { ProductInventoryPanel } from "@/features/inventory_management_system/inventory/components/product-inventory-panel";

type PageProps = { params: Promise<{ product_id: string }> };

export default async function ProductDetailPage({ params }: PageProps) {
  const { product_id } = await params;
  const t = await getTranslations("products");

  let data;
  try {
    data = await product_service.get_by_id(product_id);
  } catch {
    notFound();
  }

  const fr = data.translations.find((tr) => tr.locale === "fr");

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{fr?.name ?? data.product.slug}</h1>
          <p className="text-muted-foreground text-sm">
            {t("sku")}: {data.product.sku} · {t("slug")}: {data.product.slug}
          </p>
        </div>
        <Button asChild>
          <Link href={`/console/products/${product_id}/edit`}>{t("edit")}</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">{t("status")}</p>
          <p className="font-medium">{t(`status_${data.product.status}` as "status_draft")}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">{t("base_price")}</p>
          <p className="font-medium">
            {data.product.base_price} {data.product.currency}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">{t("offer_price")}</p>
          <p className="font-medium">{data.product.offer_price ?? "—"}</p>
        </div>
      </section>

      {fr?.description && (
        <section className="prose max-w-none rounded-lg border p-4">
          <h2 className="font-heading text-lg font-semibold">{t("description")}</h2>
          <div dangerouslySetInnerHTML={{ __html: fr.description }} />
        </section>
      )}

      <section>
        <h2 className="font-heading mb-4 text-lg font-semibold">{t("section_media")}</h2>
        <ProductMediaGallery product_id={product_id} initial_media={data.media} />
      </section>

      <section>
        <h2 className="font-heading mb-4 text-lg font-semibold">{t("section_translations")}</h2>
        <ProductTranslationsPanel product_id={product_id} translations={data.translations} />
      </section>

      <section>
        <ProductVariantsPanel
          product_id={product_id}
          product_sku={data.product.sku}
          currency={data.product.currency}
        />
      </section>

      <section>
        <h2 className="font-heading mb-4 text-lg font-semibold">{t("section_inventory")}</h2>
        <ProductInventoryPanel product_id={product_id} />
      </section>

      {/* Integrate ProductRatingSummary + ProductReviewsList on product detail page. */}

    </div>
  );
}
