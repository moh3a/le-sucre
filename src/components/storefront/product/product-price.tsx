import { cn } from "@/lib/utils";

interface ProductPriceProps {
  price: string;
  originalPrice?: string | null;
  currency?: string;
  discountLabel?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { current: "text-sm", original: "text-xs" },
  md: { current: "text-lg font-semibold", original: "text-sm" },
  lg: { current: "text-3xl font-bold", original: "text-lg" },
};

export function ProductPrice({
  price,
  originalPrice,
  currency,
  discountLabel,
  size = "md",
  className,
}: ProductPriceProps) {
  const hasDiscount = originalPrice && originalPrice !== price;
  const s = sizeClasses[size];

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("text-crimson-violet", s.current)}>
        {price} {currency}
      </span>
      {hasDiscount && (
        <span className={cn("text-muted-foreground line-through", s.original)}>
          {originalPrice} {currency}
        </span>
      )}
    </div>
  );
}
