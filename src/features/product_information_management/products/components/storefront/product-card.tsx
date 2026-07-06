"use client";

import type { ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "./product-image";
import { ProductPrice } from "./product-price";
import { ProductRating } from "./product-rating";
import { ProductQuantitySelector } from "./product-quantity-selector";
import type { StorefrontProduct, ProductCardVariant } from "@/components/storefront/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Eye } from "lucide-react";

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
  const router = useRouter();
  const linkHref = href ?? `/p/${product.slug}`;

  function goToProduct() {
    router.push(linkHref);
  }

  const hasBottomOverlay =
    (variant === "catalog" || variant === "flash-sale") && (onAddToCart || rating !== undefined);

  return (
    <Card
      className={cn(
        "group bg-background flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md",
        variant !== "cart-item" && "cursor-pointer",
        variant === "cart-item" && "flex-row",
        className,
      )}
      onClick={variant !== "cart-item" ? goToProduct : undefined}
      onKeyDown={
        variant !== "cart-item"
          ? (e) => {
              if (e.key === "Enter") goToProduct();
            }
          : undefined
      }
      tabIndex={variant !== "cart-item" ? 0 : undefined}
      role={variant !== "cart-item" ? "link" : undefined}
    >
      {/* Image section */}
      <div
        className={cn(
          "bg-muted/20 relative overflow-hidden",
          variant === "cart-item" ? "h-24 w-24 shrink-0" : "aspect-3/4 w-full",
        )}
      >
        <ProductImage
          src={product.image_url ?? undefined}
          alt={product.name}
          className={cn(
            "transition-all duration-500",
            variant !== "cart-item" && "group-hover:scale-105",
          )}
          fallback={product.name.charAt(0)}
        />

        {/* Promo / status badges */}
        {variant !== "cart-item" && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {discountPercent && (
              <Badge
                variant="destructive"
                className="rounded-full px-2.5 py-0.5 text-xs font-bold shadow"
              >
                -{discountPercent}%
              </Badge>
            )}
            {!product.in_stock && !discountPercent && (
              <Badge variant="destructive" className="rounded-full px-2.5 py-0.5 text-xs">
                Rupture
              </Badge>
            )}
            {product.is_featured && !discountPercent && (
              <Badge className="bg-crimson-violet rounded-full px-2.5 py-0.5 text-xs text-white shadow">
                Coup de cœur
              </Badge>
            )}
          </div>
        )}

        {/* Wishlist button */}
        {variant !== "cart-item" && onToggleWishlist && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 absolute top-3 right-3 z-10 h-8 w-8 rounded-full shadow backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
          >
            <Heart
              className={cn("h-4 w-4", isInWishlist && "fill-crimson-violet text-crimson-violet")}
            />
          </Button>
        )}

        {/* Bottom action overlay: rating + add to cart + view details */}
        {hasBottomOverlay && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-linear-to-t from-black/50 to-transparent p-3 pt-8"
            onClick={(e) => e.stopPropagation()}
          >
            {rating !== undefined && (
              <ProductRating
                rating={rating}
                reviewCount={reviewCount}
                size="sm"
                showCount={false}
                className="[&_.star-icon]:text-yellow-400 [&_.star-icon]:drop-shadow-sm"
              />
            )}
            <div className="flex gap-2">
              {variant === "catalog" && onAddToCart && product.in_stock && (
                <Button
                  size="sm"
                  className="flex-1 gap-2 rounded-full text-xs shadow-lg"
                  onClick={onAddToCart}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 rounded-full text-xs shadow-lg"
                onClick={goToProduct}
              >
                <Eye className="h-3.5 w-3.5" />
                Détail
              </Button>
            </div>
          </div>
        )}

        {/* Cart remove button */}
        {variant === "cart-item" && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground absolute top-1 right-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </Button>
        )}
      </div>

      {/* Content: product name + price */}
      <CardContent className={cn("flex flex-1 flex-col", variant === "cart-item" ? "p-4" : "p-3")}>
        {variant === "cart-item" ? (
          <>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-sm leading-tight font-medium">{product.name}</h3>
                {variantLabel && <p className="text-muted-foreground text-xs">{variantLabel}</p>}
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
                <ProductQuantitySelector value={quantity} onChange={onQuantityChange} />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-end gap-0.5">
            {product.brand_name && (
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {product.brand_name}
              </p>
            )}
            <h3 className="line-clamp-2 text-sm leading-tight font-medium">{product.name}</h3>
            <ProductPrice
              price={product.min_price}
              originalPrice={product.max_price}
              currency={product.currency}
              size="sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton({ variant = "catalog" }: { variant?: ProductCardVariant }) {
  return (
    <Card className="bg-background overflow-hidden rounded-2xl border">
      {variant !== "cart-item" && <Skeleton className="aspect-3/4 w-full rounded-none" />}
      <CardContent className={cn(variant === "cart-item" ? "flex gap-4 p-4" : "space-y-2 p-3")}>
        {variant === "cart-item" ? (
          <>
            <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </>
        ) : (
          <>
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
