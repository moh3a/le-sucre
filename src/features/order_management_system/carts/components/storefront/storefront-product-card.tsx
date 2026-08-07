"use client";

import { ProductCard } from "@/features/product_information_management/products/components/storefront/product-card";
import { useStorefrontCart } from "../../hooks/use-storefront-cart";

type StorefrontProductCardProps = React.ComponentProps<typeof ProductCard>;

export function StorefrontProductCard(props: StorefrontProductCardProps) {
  const { add_product } = useStorefrontCart();
  const product_id = props.product?.id;

  return (
    <ProductCard
      {...props}
      onAddToCart={() => {
        props.onAddToCart?.();
        if (product_id) void add_product({ product_id });
      }}
    />
  );
}
