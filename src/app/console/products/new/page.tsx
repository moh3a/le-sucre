import { getTranslations } from "next-intl/server";

import { ProductForm } from "@/features/product_information_management/products/components/product-form";

export default async function NewProductPage() {
  const t = await getTranslations("products");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="font-heading text-2xl font-bold">{t("new")}</h1>
      <ProductForm mode="create" />
    </div>
  );
}
