/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Heart,
  List,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  Package,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { WishlistShareDialog } from "./wishlist-share-dialog";
import type { WishlistPriority } from "../types";

interface WishlistPanelProps {
  wishlists: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_default: boolean;
    is_public: boolean;
    item_count: number;
    cover_image_url: string | null;
  }>;
  items?: Array<{
    id: string;
    product_id: string;
    wishlist_id: string;
    quantity: number;
    priority: string;
    notes: string | null;
    saved_price: string | null;
    current_price: string | null;
    is_purchased: boolean;
    product?: {
      id: string;
      slug: string;
      base_price?: string;
      offer_price?: string | null;
      translations?: Array<{ locale: string; name: string }>;
      media?: Array<{ url: string; is_primary: boolean }>;
    };
  }>;
  stats: {
    total_wishlists: number;
    total_items: number;
    total_purchased: number;
    conversion_rate: number;
  };
  selectedWishlistId?: string;
  onSelectWishlist: (id: string) => void;
  onCreateWishlist: (name: string) => Promise<void>;
  onDeleteWishlist: (id: string) => Promise<void>;
  onRemoveItem?: (itemId: string) => Promise<void>;
  onBulkAdd?: (wishlistId: string, productIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function WishlistPanel({
  wishlists,
  items,
  stats,
  selectedWishlistId,
  onSelectWishlist,
  onCreateWishlist,
  onDeleteWishlist,
  onRemoveItem,
  isLoading,
}: WishlistPanelProps) {
  const t = useTranslations("wishlist");
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const selected = wishlists.find((w) => w.id === selectedWishlistId);

  async function handleCreate() {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await onCreateWishlist(newName.trim());
      setNewName("");
    } finally {
      setIsCreating(false);
    }
  }

  const priorityColors: Record<WishlistPriority, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-600",
    high: "bg-orange-100 text-orange-600",
    urgent: "bg-red-100 text-red-600",
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              {t("my_lists")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted rounded p-2">
                <p className="font-bold">{stats.total_wishlists}</p>
                <p className="text-muted-foreground text-xs">{t("lists")}</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-bold">{stats.total_items}</p>
                <p className="text-muted-foreground text-xs">{t("items")}</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-bold">{stats.total_purchased}</p>
                <p className="text-muted-foreground text-xs">{t("purchased")}</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-bold">{stats.conversion_rate}%</p>
                <p className="text-muted-foreground text-xs">{t("conversion")}</p>
              </div>
            </div>

            <div className="space-y-1">
              {wishlists.map((wl) => (
                <button
                  key={wl.id}
                  onClick={() => onSelectWishlist(wl.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded p-2 text-sm transition-colors",
                    selectedWishlistId === wl.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <List className="h-4 w-4 shrink-0" />
                    <span className="truncate">{wl.name}</span>
                    {wl.is_default && (
                      <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                        {t("default")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-muted-foreground text-xs">{wl.item_count}</span>
                    <ChevronRight className="text-muted-foreground h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder={t("new_list_placeholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newName.trim() || isCreating}
                className="h-8"
              >
                {isCreating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selected.name}</CardTitle>
                <div className="flex gap-1">
                  <WishlistShareDialog wishlistId={selected.id} wishlistName={selected.name} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setDeleteTarget({ id: selected.id, name: selected.name })
                        }
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {selected.description && <CardDescription>{selected.description}</CardDescription>}
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              {selected?.name ?? t("items")} ({items?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </div>
            ) : !items || items.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Heart className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>{t("empty_list_message")}</EmptyTitle>
                  <EmptyDescription>{t("empty_list_hint")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    {item.product?.media?.[0]?.url && (
                      <img
                        src={item.product.media[0].url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.product?.translations?.[0]?.name ?? item.product_id}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-1.5 py-0 text-[10px]",
                            priorityColors[item.priority as WishlistPriority],
                          )}
                        >
                          {item.priority}
                        </Badge>
                        {item.is_purchased && (
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] text-green-600"
                          >
                            {t("purchased")}
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {t("quantity")}: {item.quantity}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-muted-foreground mt-1 truncate text-xs">{item.notes}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {item.current_price && (
                        <p className="text-sm font-semibold">{item.current_price} DA</p>
                      )}
                      {item.saved_price &&
                        item.current_price &&
                        item.saved_price !== item.current_price && (
                          <p className="text-xs text-green-600">
                            {Number(item.current_price) < Number(item.saved_price) ? "↓" : "↑"}{" "}
                            {t("price_change")}
                          </p>
                        )}
                    </div>
                    {onRemoveItem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => setRemoveTarget(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm_delete_description", { name: deleteTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("edit")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  onDeleteWishlist(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                if (removeTarget && onRemoveItem) {
                  onRemoveItem(removeTarget);
                  setRemoveTarget(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
