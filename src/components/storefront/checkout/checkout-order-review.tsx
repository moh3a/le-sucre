import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductImage } from "@/components/storefront/product/product-image";
import type { StorefrontProduct } from "@/components/storefront/types";

interface OrderReviewItem {
  product: StorefrontProduct;
  quantity: number;
  price: string;
}

interface CheckoutOrderReviewProps {
  title: string;
  items: OrderReviewItem[];
  ctaLabel: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
}

export function CheckoutOrderReview({
  title,
  items,
  ctaLabel,
  onCta,
  ctaDisabled,
}: CheckoutOrderReviewProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.map((item) => (
        <div key={item.product.id} className="flex items-center gap-4 py-2">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            <ProductImage
              src={item.product.image_url ?? undefined}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{item.product.name}</p>
            <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
          </div>
          <p className="font-semibold text-sm">{item.price}</p>
        </div>
      ))}
      <Separator />
      <Button className="w-full" disabled={ctaDisabled} onClick={onCta}>
        {ctaLabel}
      </Button>
    </Card>
  );
}
