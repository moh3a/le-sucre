import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ProductsPageClient } from "@/features/product_information_management/products/components/products-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("title") };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}
