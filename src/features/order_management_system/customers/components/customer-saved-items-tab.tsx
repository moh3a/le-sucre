"use client";

import { Bookmark, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type SavedItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  notes: string | null;
  saved_date: string;
  created_at: string;
};

export function CustomerSavedItemsTab({
  saved_items,
}: {
  saved_items: SavedItem[];
}) {
  const t = useTranslations("orders");

  if (saved_items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Bookmark className="mb-2 h-10 w-10" />
        <p>{t("no_saved_items")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {saved_items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bookmark className="text-muted-foreground h-4 w-4" />
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <span className="font-mono">{item.product_id.slice(0, 16)}…</span>
                    <Link
                      href={`/console/products/${item.product_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(item.saved_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">x{item.quantity}</span>
                {item.variant_id && (
                  <Badge variant="outline" className="text-[10px]">
                    SKU: {item.variant_id.slice(0, 12)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          {item.notes && (
            <CardContent className="pt-0 pb-3">
              <p className="text-muted-foreground text-sm">{item.notes}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
