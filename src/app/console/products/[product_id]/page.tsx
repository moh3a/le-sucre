import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { ProductDetailTabs } from "@/features/product_information_management/products/components/details/product-detail-tabs";

type PageProps = { params: Promise<{ product_id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product_id } = await params;
  return { title: `Produit ${product_id}` };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { product_id } = await params;
  if (!product_id) notFound();

  return (
    <ConsolePageShell
      title="Produit"
      subtitle="Détail et gestion du produit"
      back_href="/console/products"
    >
      <ProductDetailTabs product_id={product_id} />
    </ConsolePageShell>
  );
}
