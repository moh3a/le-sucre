"use client";

import { useState } from "react";
import {
  Heart,
  List,
  Plus,
  Trash2,
  Edit3,
  Share2,
  ChevronRight,
  Loader2,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              Mes listes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="p-2 bg-muted rounded">
                <p className="font-bold">{stats.total_wishlists}</p>
                <p className="text-xs text-muted-foreground">Listes</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-bold">{stats.total_items}</p>
                <p className="text-xs text-muted-foreground">Articles</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-bold">{stats.total_purchased}</p>
                <p className="text-xs text-muted-foreground">Achetés</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-bold">{stats.conversion_rate}%</p>
                <p className="text-xs text-muted-foreground">Conversion</p>
              </div>
            </div>

            <div className="space-y-1">
              {wishlists.map((wl) => (
                <button
                  key={wl.id}
                  onClick={() => onSelectWishlist(wl.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded text-sm transition-colors",
                    selectedWishlistId === wl.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <List className="h-4 w-4 shrink-0" />
                    <span className="truncate">{wl.name}</span>
                    {wl.is_default && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">{wl.item_count}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Nouvelle liste..."
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
                {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
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
                      <DropdownMenuItem onClick={() => onDeleteWishlist(selected.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {selected.description && (
                <CardDescription>{selected.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              {selected?.name ?? "Articles"} ({items?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !items || items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun article dans cette liste</p>
                <p className="text-sm">Parcourez les produits et ajoutez-les à vos listes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {item.product?.media?.[0]?.url && (
                      <img
                        src={item.product.media[0].url}
                        alt=""
                        className="h-14 w-14 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product?.translations?.[0]?.name ?? item.product_id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            priorityColors[item.priority as WishlistPriority],
                          )}
                        >
                          {item.priority}
                        </Badge>
                        {item.is_purchased && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600">
                            Acheté
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">Qté: {item.quantity}</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {item.current_price && (
                        <p className="text-sm font-semibold">{item.current_price} DA</p>
                      )}
                      {item.saved_price && item.current_price && item.saved_price !== item.current_price && (
                        <p className="text-xs text-green-600">
                          {Number(item.current_price) < Number(item.saved_price) ? "↓" : "↑"} Évolution
                        </p>
                      )}
                    </div>
                    {onRemoveItem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveItem(item.id)}
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
    </div>
  );
}
