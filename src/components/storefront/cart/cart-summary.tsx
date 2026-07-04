import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface CartSummaryLine {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CartSummaryProps {
  lines: CartSummaryLine[];
  total: string;
  totalLabel?: string;
  promoCode?: {
    placeholder: string;
    applyLabel: string;
    onApply?: (code: string) => void;
  };
  ctaLabel: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
}

export function CartSummary({
  lines,
  total,
  totalLabel = "Total",
  promoCode,
  ctaLabel,
  onCta,
  ctaDisabled,
}: CartSummaryProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">{totalLabel}</h2>
      <div className="space-y-2 text-sm">
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between">
            <span className={line.highlight ? "font-medium" : "text-muted-foreground"}>
              {line.label}
            </span>
            <span className={line.highlight ? "font-semibold" : ""}>{line.value}</span>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>{totalLabel}</span>
        <span>{total}</span>
      </div>
      {promoCode && (
        <div className="flex gap-2">
          <Input placeholder={promoCode.placeholder} className="flex-1" />
          <Button variant="outline" onClick={() => promoCode.onApply?.("")}>
            {promoCode.applyLabel}
          </Button>
        </div>
      )}
      <Button className="w-full" disabled={ctaDisabled} onClick={onCta}>
        {ctaLabel}
      </Button>
    </Card>
  );
}
