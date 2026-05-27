import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { product_service } from "@/features/product_information_management/products/services/product.service";
import { ProductForm } from "@/features/product_information_management/products/components/product-form";

type PageProps = { params: Promise<{ product_id: string }> };

export default async function EditProductPage({ params }: PageProps) {
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
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="font-heading text-2xl font-bold">{t("edit")}</h1>
      <ProductForm
        mode="edit"
        product_id={product_id}
        default_values={{
          name: fr?.name ?? "",
          description: fr?.description ?? "",
          keywords: fr?.keywords ?? "",
          seo_title: fr?.seo_title ?? data.product.seo_title ?? "",
          seo_description: fr?.seo_description ?? data.product.seo_description ?? "",
          sku: data.product.sku,
          slug: data.product.slug,
          category_id: data.product.category_id,
          brand_id: data.product.brand_id,
          base_price: Number(data.product.base_price),
          offer_price: data.product.offer_price ? Number(data.product.offer_price) : null,
          currency: data.product.currency,
          status: data.product.status as "draft" | "published" | "archived",
          is_featured: data.product.is_featured,
          metadata: (data.product.metadata as Record<string, unknown>) ?? {},
        }}
      />
    </div>
  );
}
