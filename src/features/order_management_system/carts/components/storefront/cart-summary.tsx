"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DataState } from "@/components/storefront/data-state";

interface SummaryLine {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CartSummaryProps {
  lines?: SummaryLine[];
  total?: string;
  isLoading?: boolean;
  error?: unknown;
  totalLabel?: string;
  promoCode?: {
    placeholder: string;
    applyLabel: string;
    onApply?: (code: string) => void;
    isLoading?: boolean;
  };
  ctaLabel: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
}

export function CartSummary({
  lines = [],
  total,
  isLoading,
  error,
  totalLabel = "Total",
  promoCode,
  ctaLabel,
  onCta,
  ctaDisabled,
}: CartSummaryProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={false}
      loadingState={<CartSummarySkeleton />}
    >
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">{totalLabel}</h2>
        <div className="space-y-2 text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex justify-between">
              <span className={line.highlight ? "font-medium" : "text-muted-foreground"}>
                {line.label}
              </span>
              <span className={cn(line.highlight && "font-semibold")}>{line.value}</span>
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
            <Input placeholder={promoCode.placeholder} className="flex-1" disabled={promoCode.isLoading} />
            <Button variant="outline" disabled={promoCode.isLoading} onClick={() => promoCode.onApply?.("")}>
              {promoCode.isLoading ? "..." : promoCode.applyLabel}
            </Button>
          </div>
        )}
        <Button className="w-full" disabled={ctaDisabled} onClick={onCta}>
          {ctaLabel}
        </Button>
      </Card>
    </DataState>
  );
}

import { cn } from "@/lib/utils";

function CartSummarySkeleton() {
  return (
    <Card className="space-y-4 p-6">
      <Skeleton className="h-5 w-20" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
    </Card>
  );
}
