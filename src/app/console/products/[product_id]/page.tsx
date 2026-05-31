import { notFound } from "next/navigation";
import { product_service } from "@/features/product_information_management/products/services/product.service";
import { ProductDetailTabs } from "@/features/product_information_management/products/components/product-detail-tabs";

type PageProps = { params: Promise<{ product_id: string }> };

export default async function ProductDetailPage({ params }: PageProps) {
  const { product_id } = await params;
  let data;
  try {
    data = await product_service.get_by_id(product_id);
  } catch {
    notFound();
  }

  return (
    <div className="p-6">
      <ProductDetailTabs
        product_id={product_id}
        product={data.product}
        translations={data.translations}
        media={data.media}
      />
    </div>
  );
}
