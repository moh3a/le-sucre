"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/storefront/product/product-image";
import { ProductPrice } from "@/components/storefront/product/product-price";
import { ProductRating } from "@/components/storefront/product/product-rating";
import { ProductQuantitySelector } from "@/components/storefront/product/product-quantity-selector";
import type { StorefrontProduct, ProductCardVariant } from "@/components/storefront/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: StorefrontProduct;
  variant?: ProductCardVariant;
  className?: string;
  /** For cart-item variant */
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  variantLabel?: string;
  /** Actions */
  onAddToCart?: () => void;
  onRemove?: () => void;
  onToggleWishlist?: () => void;
  onAddToCompare?: () => void;
  isInWishlist?: boolean;
  isInCompare?: boolean;
  /** For flash-sale variant */
  discountPercent?: number;
  /** Rating */
  rating?: number;
  reviewCount?: number;
  /** Override the default HREF */
  href?: string;
  /** Extra actions rendered at bottom */
  actions?: ReactNode;
}

export function ProductCard({
  product,
  variant = "catalog",
  className,
  quantity = 1,
  onQuantityChange,
  variantLabel,
  onAddToCart,
  onRemove,
  onToggleWishlist,
  onAddToCompare,
  isInWishlist,
  isInCompare,
  discountPercent,
  rating,
  reviewCount,
  href,
  actions,
}: ProductCardProps) {
  const hasDiscount = product.max_price && product.min_price !== product.max_price;
  const linkHref = href ?? `/p/${product.slug}`;

  const cardContent = (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-primary-foreground/15 bg-background transition-all duration-300 hover:shadow-xl",
        variant === "catalog" && "hover:border-crimson-violet/40",
        variant === "flash-sale" && "border-destructive/30 hover:border-destructive/60",
        variant === "cart-item" && "flex-row",
        className,
      )}
    >
      {/* Image section */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted/20",
          variant === "cart-item" ? "h-24 w-24 shrink-0" : "aspect-square w-full",
        )}
      >
        <ProductImage
          src={product.image_url ?? undefined}
          alt={product.name}
          className={cn(
            "transition-transform duration-500",
            variant !== "cart-item" && "group-hover:scale-105",
          )}
          fallback={product.name.charAt(0)}
        />

        {/* Badges */}
        {variant !== "cart-item" && (
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {!product.in_stock && (
              <Badge variant="destructive" className="border-0 px-2 py-0.5">
                Rupture
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="border-0 bg-crimson-violet px-2 py-0.5 text-white">
                Coup de cœur
              </Badge>
            )}
            {discountPercent && (
              <Badge variant="destructive" className="border-0 px-2 py-0.5">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        )}

        {/* Cart remove button */}
        {variant === "cart-item" && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </Button>
        )}
      </div>

      {/* Content */}
      <CardContent
        className={cn(
          "flex flex-1 flex-col",
          variant === "cart-item" ? "p-4" : "p-4 pt-3",
        )}
      >
        {variant === "cart-item" ? (
          <>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium leading-tight">{product.name}</h3>
                {variantLabel && (
                  <p className="text-muted-foreground text-xs">{variantLabel}</p>
                )}
              </div>
              <ProductPrice
                price={product.min_price}
                originalPrice={product.max_price}
                currency={product.currency}
                size="sm"
              />
            </div>
            <div className="flex items-end justify-between gap-2">
              {onQuantityChange && (
                <ProductQuantitySelector
                  value={quantity}
                  onChange={onQuantityChange}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 space-y-1">
              {product.brand_name && (
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {product.brand_name}
                </p>
              )}
              <h3
                className={cn(
                  "line-clamp-2 leading-snug transition-colors",
                  variant === "flash-sale"
                    ? "text-destructive group-hover:text-destructive/80"
                    : "group-hover:text-crimson-violet",
                  variant === "catalog" ? "font-orla text-base" : "text-sm font-medium",
                )}
              >
                {product.name}
              </h3>
            </div>

            {rating !== undefined && (
              <ProductRating rating={rating} reviewCount={reviewCount} className="mt-1" />
            )}

            <ProductPrice
              price={product.min_price}
              originalPrice={product.max_price}
              currency={product.currency}
              size={variant === "flash-sale" ? "lg" : "md"}
              className="mt-2 border-t border-primary-foreground/5 pt-2"
            />

            {actions ? (
              <div className="mt-3">{actions}</div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {variant === "catalog" && onAddToCart && product.in_stock && (
                  <Button size="sm" className="flex-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(); }}>
                    Add to cart
                  </Button>
                )}
                {onToggleWishlist && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(); }}
                  >
                    {isInWishlist ? "♥" : "♡"}
                  </Button>
                )}
                {onAddToCompare && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCompare(); }}
                  >
                    {isInCompare ? "⊟" : "⊞"}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (variant === "cart-item") {
    return cardContent;
  }

  return <Link href={linkHref}>{cardContent}</Link>;
}

export function ProductCardSkeleton({ variant = "catalog" }: { variant?: ProductCardVariant }) {
  return (
    <Card className="animate-pulse border border-primary-foreground/15 bg-background">
      {variant !== "cart-item" && (
        <div className="bg-muted aspect-square w-full" />
      )}
      <CardContent className={cn("space-y-3", variant === "cart-item" ? "flex gap-4 p-4" : "p-4")}>
        {variant === "cart-item" ? (
          <>
            <div className="bg-muted h-16 w-16 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-4 w-2/3 rounded" />
              <div className="bg-muted h-3 w-1/2 rounded" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-muted h-3 w-1/4 rounded" />
            <div className="bg-muted h-4 w-3/4 rounded" />
            <div className="bg-muted h-4 w-1/2 rounded" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
