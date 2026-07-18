"use client";

import {
  Heart,
  ChevronDown,
  ChevronRight,
  Globe,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type WishlistItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  priority: string;
  notes: string | null;
  saved_price: string | null;
  current_price: string | null;
  is_purchased: boolean;
  created_at: string;
};

type Wishlist = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  is_public: boolean;
  is_private: boolean;
  item_count: number;
  shared_count: number;
  created_at: string;
  updated_at: string;
  items: WishlistItem[];
};

function WishlistItemRow({ item }: { item: WishlistItem }) {
  const t = useTranslations("orders");
  return (
    <div className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="max-w-[180px] truncate font-medium">{item.product_id.slice(0, 16)}</span>
        {item.variant_id && (
          <span className="text-muted-foreground text-xs">SKU: {item.variant_id.slice(0, 12)}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">x{item.quantity}</span>
        <Badge variant={item.priority === "high" ? "default" : "outline"} className="text-[10px]">
          {item.priority}
        </Badge>
        {item.is_purchased && (
          <Badge variant="secondary" className="text-[10px]">{t("purchased")}</Badge>
        )}
        {item.saved_price && (
          <span className="tabular-nums text-xs">
            {Number(item.saved_price).toLocaleString("fr-FR")} DZD
          </span>
        )}
      </div>
    </div>
  );
}

function WishlistCard({ wishlist }: { wishlist: Wishlist }) {
  const t = useTranslations("orders");
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  {wishlist.name}
                  {wishlist.is_default && (
                    <Badge variant="secondary" className="text-[10px]">{t("default")}</Badge>
                  )}
                  {wishlist.is_public ? (
                    <Globe className="text-muted-foreground h-3 w-3" />
                  ) : wishlist.is_private ? (
                    <Lock className="text-muted-foreground h-3 w-3" />
                  ) : null}
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  {formatDate(wishlist.created_at)}
                  {wishlist.description ? ` — ${wishlist.description}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {wishlist.items.length} {wishlist.items.length > 1 ? t("items") : t("item")}
              </Badge>
              {wishlist.shared_count > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {wishlist.shared_count} {t("shared")}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="space-y-2 pt-0 pb-4">
          {wishlist.items.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-sm">{t("empty_wishlist")}</p>
          ) : (
            wishlist.items.map((item) => <WishlistItemRow key={item.id} item={item} />)
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function CustomerWishlistsTab({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const t = useTranslations("orders");

  if (wishlists.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Heart className="mb-2 h-10 w-10" />
        <p>{t("no_wishlists")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wishlists.map((wl) => (
        <WishlistCard key={wl.id} wishlist={wl} />
      ))}
    </div>
  );
}
