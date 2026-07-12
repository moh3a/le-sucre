import type { Metadata } from "next";

import { ProductsPageClientTabbed } from "@/features/product_information_management/products/components/products-page-tabbed";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Produits" };
}

export default function ProductsPage() {
  return <ProductsPageClientTabbed />;
}
