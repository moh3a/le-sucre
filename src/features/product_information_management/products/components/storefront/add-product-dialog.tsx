"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/components/providers/app-providers";

interface AddProductDialogProps {
  onSelect: (slug: string) => void;
  existingSlugs: string[];
  categoryId?: string;
  trigger: ReactNode;
}

export function AddProductDialog({
  onSelect,
  existingSlugs,
  categoryId,
  trigger,
}: AddProductDialogProps) {
  const t = useTranslations("compare");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = trpc.catalog.search.useQuery(
    {
      category_id: categoryId,
      q: search || undefined,
      limit: 12,
      page: 1,
      sort: "relevance",
    },
    { enabled: open, placeholderData: (prev) => prev },
  );

  const products = data?.items ?? [];
  const filtered = products.filter((p) => !existingSlugs.includes(p.slug));

  function handleSelect(slug: string) {
    onSelect(slug);
    setOpen(false);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("add_product_title") || "Ajouter un produit"}</DialogTitle>
          <DialogDescription>
            {t("add_product_desc") || "Recherchez un produit à comparer"}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder={t("search_placeholder") || "Rechercher un produit..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {search
                ? t("no_results") || "Aucun résultat"
                : t("no_more_products") || "Aucun autre produit disponible"}
            </p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelect(product.slug)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
              >
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-12 w-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground">
                    {product.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {product.min_price} {product.currency}
                    {product.brand_name && ` - ${product.brand_name}`}
                  </p>
                </div>
                <Plus className="text-muted-foreground h-4 w-4 shrink-0" />
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
