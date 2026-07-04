"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataState } from "@/components/storefront/data-state";
import type { CouponItem } from "@/components/storefront/types";

interface PromotionCouponCardProps {
  coupon?: CouponItem;
  isLoading?: boolean;
  error?: unknown;
  onCopy?: (code: string) => void;
}

export function PromotionCouponCard({ coupon, isLoading, error, onCopy }: PromotionCouponCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!coupon) return;
    setCopied(true);
    onCopy?.(coupon.code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!coupon}
      loadingState={
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-20 rounded-md" />
          </CardContent>
        </Card>
      }
      emptyState={null}
    >
      {coupon && (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">{coupon.code}</CardTitle>
            <CardDescription>{coupon.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Input value={coupon.code} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copié !" : "Copier"}
            </Button>
          </CardContent>
        </Card>
      )}
    </DataState>
  );
}
