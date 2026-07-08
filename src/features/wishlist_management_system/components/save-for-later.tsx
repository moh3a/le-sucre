/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Clock, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSaveForLater } from "../hooks/use-wishlist";

export interface SaveForLaterPanelProps {
  items: Array<{
    id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    product?: {
      id: string;
      slug: string;
      name?: string;
      base_price?: string;
      offer_price?: string | null;
      image_url?: string;
    };
  }>;
  onMovedToCart?: (productId: string, variantId: string | null, quantity: number) => void;
}

export function SaveForLaterPanel({ items, onMovedToCart }: SaveForLaterPanelProps) {
  const { moveToCart, removeSaved } = useSaveForLater();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  async function handleMoveToCart(item: SaveForLaterPanelProps["items"][number]) {
    setPendingId(item.id);
    try {
      await moveToCart({ id: item.id, quantity: item.quantity });
      onMovedToCart?.(item.product_id, item.variant_id, item.quantity);
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(id: string) {
    setPendingId(id);
    try {
      await removeSaved(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Sauvegardé pour plus tard ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {item.product?.image_url && (
                <img
                  src={item.product.image_url}
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium">{item.product?.name ?? item.product_id}</p>
                <p className="text-muted-foreground text-xs">Qté: {item.quantity}</p>
                {item.product?.offer_price && (
                  <p className="text-primary text-sm font-semibold">
                    {item.product.offer_price} DA
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveToCart(item)}
                disabled={pendingId === item.id}
              >
                {pendingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(item.id)}
                disabled={pendingId === item.id}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
