"use client";

import { useTranslations } from "next-intl";
import { PackageOpen } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/product/product-card";
import type { StorefrontProduct } from "@/components/storefront/types";
import type { CatalogProductCard as ProductType } from "../types";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";

interface CatalogProductGridProps {
  products: ProductType[];
  isLoading?: boolean;
}

function to_storefront(p: ProductType): StorefrontProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image_url: p.image_url,
    currency: p.currency,
    min_price: p.min_price,
    max_price: p.max_price,
    is_featured: p.is_featured,
    in_stock: p.in_stock,
    brand_name: p.brand_name,
  };
}

export function CatalogProductGrid({ products, isLoading }: CatalogProductGridProps) {
  const t = useTranslations("catalog");

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="catalog" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("no_results")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={to_storefront(product)}
          variant="catalog"
          href={`/p/${product.slug}`}
        />
      ))}
    </div>
  );
}
