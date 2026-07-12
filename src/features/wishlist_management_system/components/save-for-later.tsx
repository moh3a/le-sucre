/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Clock, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const t = useTranslations("wishlist");
  const { moveToCart, removeSaved } = useSaveForLater();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  if (items.length === 0) return null;

  async function handleMoveToCart(item: SaveForLaterPanelProps["items"][number]) {
    setPendingId(item.id);
    try {
      await moveToCart({ id: item.id, quantity: item.quantity });
      toast.success(t("moved_to_cart"));
      onMovedToCart?.(item.product_id, item.variant_id, item.quantity);
    } catch {
      toast.error(t("moved_to_cart"));
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(id: string) {
    setPendingId(id);
    try {
      await removeSaved(id);
      toast.success(t("item_removed_saved"));
    } catch {
      toast.error(t("item_removed_saved"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          {t("saved_for_later_title")} ({items.length})
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
                <p className="text-muted-foreground text-xs">
                  {t("quantity")}: {item.quantity}
                </p>
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
                onClick={() => setRemoveTarget(item.id)}
                disabled={pendingId === item.id}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <AlertDialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_remove_item_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm_remove_item_description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("edit")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removeTarget) {
                  handleRemove(removeTarget);
                  setRemoveTarget(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
