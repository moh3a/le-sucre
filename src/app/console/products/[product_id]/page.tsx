import { ProductDetailTabs } from "@/features/product_information_management/products/components/details/product-detail-tabs";

type PageProps = { params: Promise<{ product_id: string }> };

export default async function ProductDetailPage({ params }: PageProps) {
  const { product_id } = await params;

  return (
    <div className="p-6">
      <ProductDetailTabs product_id={product_id} />
    </div>
  );
}
